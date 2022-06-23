import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import utils from "./utils";
import BigNumber from "bignumber.js";
import { changeLoad } from "../redux/action";

const NftDisplay = ({ state, changeLoad }) => {
  const { tokenInstance, auctionInstance, currentAccount, load } = state;

  const [curBidder, setCurBidder] = useState("");
  const [curBid, setCurBid] = useState("");
  const [nftImg, setNftImg] = useState("");
  const [justStarted, setJustStarted] = useState(false);
  const [amount, setAmount] = useState("");

  useEffect(() => {
    (async () => {
      await getData();
    })();
  }, [currentAccount]);

  const handleBid = async () => {
    if (amount <= 0) return alert("Invalid Amount !!");
    if (!auctionInstance.address) return alert("Contract not connected !!");
    try {
      const amountBN = new BigNumber(amount * 10 ** 18);
      const tx = await auctionInstance.bid({
        from: currentAccount,
        value: amountBN.toFixed(),
      });
      await tx.wait();
      changeLoad(!load);
      setAmount("");
    } catch (err) {
      utils.handleError(err);
    }
  };

  const getData = async () => {
    if (!tokenInstance.address || !auctionInstance.address) return;

    try {
      const _nft = await tokenInstance.getTokenById(0);
      setNftImg(_nft.url);
      //   console.log(nftImg);

      const _curBid = await auctionInstance.highestBid();
      const curBidBN = new BigNumber(_curBid._hex);
      setCurBid(curBidBN.dividedBy(10 ** 18).toString());

      const _curBidder = await auctionInstance.highestBidder();
      setJustStarted(parseInt(_curBidder, 16) === 0);

      const dispBidder = utils.shortHash(_curBidder);
      setCurBidder(dispBidder);
    } catch (err) {
      utils.handleError(err);
    }
  };
  return (
    <div className="nft-display">
      <div className="nft-display__container">
        <div className="nft-display__container--upper">
          <img alt="NFT image" src={nftImg} />
        </div>
        <div className="nft-display__container--lower">
          <div className="nft-display__container--lower__info">
            <div className="nft-display__container--lower__info--item">
              <div className="info-item__title">Current Bid:</div>
              <div className="info-item__value">{curBid} ETH</div>
            </div>
            {justStarted ? (
              <>
                <div className="just-started__text">
                  No bidder as the auction just started !!
                </div>
              </>
            ) : (
              <div className="nft-display__container--lower__info--item">
                <span className="info-item__title">Current Bidder:</span>
                <span className="info-item__value">{curBidder}</span>
              </div>
            )}
          </div>
          <div className="nft-display__container--lower__text">
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              type="number"
              placeholder="Place your bid here"
            />
            <button onClick={handleBid}>Bid</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => ({ state });
export default connect(mapStateToProps, { changeLoad })(NftDisplay);
