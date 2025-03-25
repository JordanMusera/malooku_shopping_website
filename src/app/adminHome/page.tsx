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
    <div className="h-screen bg-white w-screen flex flex-col">
      

      <div className="w-full flex h-full">
          <SellerSideBar
            clickedTab={handleClickedTab}
            toggleMenuVisibility={toggleMenuVisibility}
          />
       
        
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
  );
};

export default page;
