import { useEffect } from "react";
import {
  checkMetamaskStatus,
  connectMetamask,
  firstFunc,
  listenToEvents,
} from "./configureMetamask";

import { connect } from "react-redux";
import {
  changeAuctionInstance,
  changeTokenInstance,
  changeLoad,
  changeCurrentAccount,
  changeMetamaskConnectFunction,
  changeMetamaskStatus,
  changeNetworkId,
} from "../redux/action";
import NftDisplay from "./NftDisplay";

const Layout = ({
  children,
  changeAuctionInstance,
  changeTokenInstance,
  changeMetamaskConnectFunction,
  changeCurrentAccount,
  changeLoad,
  changeNetworkId,
  changeMetamaskStatus,
  state,
}) => {
  const {
    currentAccount,
    load,
    networkId,
    metamaskStatus,
    metamaskConnectFunction,
  } = state;

  //default
  useEffect(() => {
    firstFunc(
      changeAuctionInstance,
      changeTokenInstance,
      changeCurrentAccount,
      changeNetworkId,
      changeMetamaskStatus
    );
    checkMetamaskStatus(
      changeMetamaskStatus,
      changeCurrentAccount,
      changeNetworkId
    );
    changeMetamaskConnectFunction(connectMetamask);
  }, []);

  // for updating the change when metamask configuration changes !!
  useEffect(() => {
    // function to update the values of state
    //    getContractData();
    // for listening of events
    //    listenToEvents(contract);
  }, [currentAccount, load]);

  return <>{children}</>;
};

const mapStateToState = (state) => ({ state });
export default connect(mapStateToState, {
  changeAuctionInstance,
  changeTokenInstance,
  changeMetamaskConnectFunction,
  changeCurrentAccount,
  changeLoad,
  changeNetworkId,
  changeMetamaskStatus,
})(Layout);
