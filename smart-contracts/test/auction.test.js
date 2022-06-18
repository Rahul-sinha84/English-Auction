const { ethers, waffle } = require("hardhat");
const { expect } = require("./setupChai");
const { BigNumber } = require("ethers");

describe("Auction", () => {
  let auction, erc721, deployer, recepient, anotherAcc;

  const provider = waffle.provider;
  const nftUrl =
    "https://images.unsplash.com/photo-1642525027649-00d7397a6d4a?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80";
  const startingBid = BigNumber.from(ethers.utils.parseEther("2"));
  before(async () => {
    [deployer, recepient, anotherAcc] = await ethers.getSigners();

    const Erc721 = await ethers.getContractFactory("MyNFT");
    erc721 = await Erc721.deploy();
    await erc721.deployed();

    //minting an NFT and sending it to the deployer...
    const tx1 = await erc721.safeMint(deployer.address, nftUrl);
    await tx1.wait();

    const Auction = await ethers.getContractFactory("Auction");
    auction = await Auction.deploy(erc721.address, 0, startingBid);
    await auction.deployed();

    //approving auction contract to transfer the token....
    const tx2 = await erc721.connect(deployer).approve(auction.address, 0);
    await tx2.wait();

    //starting the auction...
    const tx3 = await auction.connect(deployer).startAuction();
    await tx3.wait();
  });

  it("deployed successfully", async () => {
    const erc721Add = erc721.address;
    const auctionAdd = auction.address;

    expect(erc721Add).to.not.be.equal(0x0);
    expect(erc721Add).to.not.be.equal(null);
    expect(erc721Add).to.not.be.equal(undefined);
    expect(erc721Add).to.not.be.equal("");

    expect(auctionAdd).to.not.be.equal(0x0);
    expect(auctionAdd).to.not.be.equal(null);
    expect(auctionAdd).to.not.be.equal(undefined);
    expect(auctionAdd).to.not.be.equal("");
  });

  it("NFT details", async () => {
    const nft = await erc721.getTokenById(0);
    const nftOwner = await erc721.ownerOf(0);

    expect(nftOwner).to.be.equal(auction.address);
    expect(nft.id).to.be.equal(0);
    expect(nft.url).to.be.equal(nftUrl);
  });

  it("Auction details", async () => {
    const _highestBid = await auction.highestBid();

    const _nftID = await auction.nftID();
    const _seller = await auction.seller();
    const _start = await auction.start();

    expect(_start).to.be.equal(true);
    expect(_highestBid).to.be.equal(startingBid);
    expect(_nftID).to.be.equal(0);
    expect(_seller).to.be.equal(deployer.address);
  });

  it("Bidding", async () => {
    await expect(
      auction.bid({ value: ethers.utils.parseEther("1") }),
      "The bidding value must be greater than Current Value !!"
    ).to.eventually.be.rejected;

    const bidValue = BigNumber.from(ethers.utils.parseEther("3"));

    await expect(auction.connect(recepient).bid({ value: bidValue })).to
      .eventually.be.fulfilled;

    const _biddedAmount = await auction.bids(recepient.address);
    const _contractBal = await auction.contractBalance();
    const _curBid = await auction.highestBid();
    const _highestBidder = await auction.highestBidder();

    expect(_contractBal).to.be.equal(bidValue);
    expect(_biddedAmount).to.be.equal(bidValue);
    expect(_curBid).to.be.equal(bidValue);
    expect(_highestBidder).to.be.equal(recepient.address);
  });

  it("withdraw amount", async () => {
    const bidValue = BigNumber.from(ethers.utils.parseEther("5"));
    await expect(auction.connect(anotherAcc).bid({ value: bidValue })).to
      .eventually.be.fulfilled;

    const beforeBal = await provider.getBalance(recepient.address);

    const tx1 = await auction.connect(recepient).withdraw();
    await tx1.wait();

    const afterBal = await provider.getBalance(recepient.address);
    const recBidVal = await auction.bids(recepient.address);

    expect(afterBal > beforeBal).to.be.equal(true);
    expect(recBidVal).to.be.equal(0);
  });

  it("end auction", async () => {
    await expect(auction.connect(recepient).end()).to.eventually.be.rejected;

    const prevBal = BigNumber.from(await provider.getBalance(deployer.address));
    const _highestBidder = await auction.highestBidder();

    //forwarding time
    await provider.send("evm_increaseTime", [7 * 24 * 60 * 60]);

    await expect(auction.end()).to.eventually.be.fulfilled;

    const afterBal = BigNumber.from(
      await provider.getBalance(deployer.address)
    );

    expect(afterBal.sub(prevBal).isNegative()).to.be.equal(false);

    const _owner = await erc721.ownerOf(0);

    expect(_owner).to.be.equal(_highestBidder);
  });
});
