import React from "react";
import NftDisplay from "../components/NftDisplay";
import Profile from "../components/Profile";
import ContracInfo from "../components/ContracInfo";
const Main = () => {
  return (
    <div className="main">
      <div className="main__item">
        <ContracInfo />
      </div>
      <div className="main__item">
        <NftDisplay />
      </div>
      <div className="main__item">
        <Profile />
      </div>
    </div>
  );
};

export default Main;
