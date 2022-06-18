// SPDX-License-Identifier: MIT
pragma solidity <=0.8.4;

import "./erc721.sol";

contract Auction {
    event Start(uint256 _timestamp, address _seller);
    event Bid(address _bidder, uint256 _bid);
    event Withdraw(address _address, uint256 _amount);
    event End(address _bidder, uint256 _amount);

    MyNFT public auctionNFT;
    uint256 public nftID;

    uint256 public highestBid;
    address public highestBidder;
    bool public start;
    bool public ended;
    address public seller;
    uint256 public endAt;
    mapping(address => uint256) public bids;

    constructor(
        address _auctionNFT,
        uint256 _nftID,
        uint256 _startingBid
    ) {
        auctionNFT = MyNFT(_auctionNFT);
        nftID = _nftID;
        highestBid = _startingBid;
        seller = msg.sender;
    }

    function contractBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function startAuction() public onlySeller {
        require(!start, "Already Started !!");

        auctionNFT.transferFrom(msg.sender, address(this), nftID);
        start = true;
        endAt = block.timestamp + 7 days;

        emit Start(block.timestamp, seller);
    }

    function bid() public payable isStart {
        require(block.timestamp < endAt, "Auction already ended !!");
        require(
            msg.value > highestBid,
            "Amount is not higher than current bid !!"
        );

        bids[msg.sender] += msg.value;

        highestBidder = msg.sender;
        highestBid = msg.value;

        emit Bid(msg.sender, msg.value);
    }

    function withdraw() public {
        uint256 bal = bids[msg.sender];

        (bool success, ) = payable(msg.sender).call{value: bal}("");
        require(success, "Failed to transfer your bidding amount !!");

        bids[msg.sender] = 0;
        emit Withdraw(msg.sender, bal);
    }

    function end() public isStart onlySeller {
        require(!ended, "Already ended !!");
        require(block.timestamp >= endAt, "Expiration period is not over !!");
        ended = true;

        if (highestBidder != address(0)) {
            (bool success, ) = payable(seller).call{value: highestBid}("");
            require(success, "Failed to transfer amount !!");
            auctionNFT.safeTransferFrom(address(this), highestBidder, nftID);
        } else {
            auctionNFT.safeTransferFrom(address(this), seller, nftID);
        }

        emit End(highestBidder, highestBid);
    }

    modifier isStart() {
        require(start, "Auction is not started yet !!");
        _;
    }

    modifier onlySeller() {
        require(msg.sender == seller, "Only Seller required !!");
        _;
    }
}
