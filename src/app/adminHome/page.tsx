"use client";
import React, { useState } from "react";
import SellerSideBar from "../components/SellerSideBar";
import SellerTopBar from "../components/SellerTopBar";
import SellerOrders from "../components/SellerOrders";
import SellerProductsContainer from "../components/SellerProductsContainer";
import SellerUsersContainer from "../components/SellerUsersContainer";
import SellerPaymentsContainer from "../components/SellerPaymentsContainer";

const page = () => {
  const [clickedTab, setClickedTab] = useState("");
  const [menuVisibility, setMenuVisibility] = useState(false);

  const handleClickedTab = (tab: string) => {
    setClickedTab(tab);
  };

  const toggleMenuVisibility = () => {
    setMenuVisibility((prev) => !prev);
  };

  return (
    <div className="h-screen bg-white w-screen flex flex-col relative">
      <div className="fixed top-0 z-50 w-full md:hidden">
        <SellerTopBar toggleMenuVisibility={toggleMenuVisibility} />
      </div>

      <div className="w-full flex h-full">
        <div
          className={`col-span-1 bg-white h-full absolute shadow-2xl w-2/3 z-50 transition-transform duration-300 ${
            menuVisibility ? "translate-x-0" : "-translate-x-full"
          } xl:static xl:w-1/4`}
        >
          <SellerSideBar
            clickedTab={handleClickedTab}
            toggleMenuVisibility={toggleMenuVisibility}
          />
        </div>
        <div>
          <div className="fixed top-0 z-50 w-full">
            <SellerTopBar toggleMenuVisibility={toggleMenuVisibility} />
          </div>
          <div className="w-full bg-gray-100 h-full xl:rounded-tl-2xl pt-10 flex overflow-auto">
            {clickedTab === "ordersTab" && <SellerOrders />}
            {clickedTab === "productsTab" && <SellerProductsContainer />}
            {clickedTab === "usersTab" && <SellerUsersContainer />}
            {clickedTab === "paymentTab" && <SellerPaymentsContainer />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
