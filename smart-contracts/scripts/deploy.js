const { BigNumber } = require("ethers");
const hre = require("hardhat");

const main = async () => {
  const { ethers } = hre;
  const [deployer] = await ethers.getSigners();
  const startingBid = BigNumber.from(ethers.utils.parseEther("2"));
  const nftURL =
    "https://images.unsplash.com/photo-1642525027649-00d7397a6d4a?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80";

  const Erc721 = await ethers.getContractFactory("MyNFT");
  const erc721 = await Erc721.deploy();
  await erc721.deployed();

  //minting an NFT and sending it to the deployer...
  const tx1 = await erc721.safeMint(deployer.address, nftURL);
  await tx1.wait();

  const Auction = await ethers.getContractFactory("Auction");
  const auction = await Auction.deploy(erc721.address, 0, startingBid);
  await auction.deployed();

  //approving auction contract to transfer the token...
  const tx2 = await erc721.connect(deployer).approve(auction.address, 0);
  await tx2.wait();

  //starting the auction...
  const tx3 = await auction.connect(deployer).startAuction();
  await tx3.wait();

  console.log(`ERC721: ${erc721.address}, Auction: ${auction.address}`);
};

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
