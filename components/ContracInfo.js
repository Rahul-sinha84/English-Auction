import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import utils from "./utils";

const ContracInfo = ({ state }) => {
  const { auctionInstance, currentAccount } = state;

  const [seller, setSeller] = useState("");
  const [endAt, setEndAt] = useState("");

  useEffect(() => {
    (async () => {
      await getData();
    })();
  }, [currentAccount]);

  const getData = async () => {
    if (!auctionInstance.address) return;

    try {
      const _seller = await auctionInstance.seller();
      const dispSeller = utils.shortHash(_seller);
      setSeller(dispSeller);

      const _endAt = await auctionInstance.endAt();
      const date = new Date(_endAt.toNumber() * 1000);
      const dateVisible = `${date.getDate()} ${utils.getMonthbyNumber(
        date.getMonth() + 1
      )} ${date.getFullYear()}`;

      setEndAt(dateVisible);
    } catch (err) {
      utils.handleError(err);
    }
  };

  return (
    <div className="contract-info">
      <div className="contract-info__upper">
        <div className="contract-info__upper--title">Contract Info</div>
      </div>
      <div className="contract-info__lower">
        <div className="contract-info__lower--item">
          <div className="contract-info__lower--item__title"></div>
          <div className="contract-info__lower--item__value"></div>
        </div>
        <div className="contract-info__lower--item">
          <div className="contract-info__lower--item__title">Seller: </div>
          <div className="contract-info__lower--item__value">{seller}</div>
        </div>
        <div className="contract-info__lower--item">
          <div className="contract-info__lower--item__title">
            Auction will end on:{" "}
          </div>
          <div className="contract-info__lower--item__value">{endAt}</div>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => ({ state });

export default connect(mapStateToProps)(ContracInfo);
