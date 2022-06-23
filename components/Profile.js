import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import utils from "./utils";
import BigNumber from "bignumber.js";
import { ethers } from "ethers";

const Profile = ({ state }) => {
  const { currentAccount, tokenInstance, auctionInstance, load } = state;

  const [dispCurAcc, setDispCurAcc] = useState("");
  const [bid, setBid] = useState("");

  useEffect(() => {
    (async () => {
      await getData();
    })();
  }, [currentAccount, load]);

  const getData = async () => {
    if (!tokenInstance.address || !auctionInstance.address) return;

    try {
      const _dispCurAcc = utils.shortHash(currentAccount);
      setDispCurAcc(_dispCurAcc);
      const _bids = await auctionInstance.bids(currentAccount);
      const bidsBN = new BigNumber(_bids._hex);
      setBid(bidsBN.dividedBy(10 ** 18).toString());
    } catch (err) {
      utils.handleError(err);
    }
  };

  return (
    <div className="profile">
      <div className="profile__upper">
        <div className="profile__upper--title">Your Profile</div>
      </div>
      <div className="profile__lower">
        <div className="profile__lower--item">
          <div className="profile__lower--item__title">Address: </div>
          <div className="profile__lower--item__value">{dispCurAcc}</div>
        </div>
        <div className="profile__lower--item">
          <div className="profile__lower--item__title">Your Bid: </div>
          <div className="profile__lower--item__value">{bid} ETH</div>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => ({ state });
export default connect(mapStateToProps)(Profile);
