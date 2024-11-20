"use client";
import React, { useState } from "react";
import { AiOutlineComment, AiOutlineEdit, AiOutlineHeart, AiOutlineLock, AiOutlineNotification, AiOutlineProfile, AiOutlineSecurityScan, AiOutlineShopping, AiOutlineUser } from "react-icons/ai";
import { FaComment } from "react-icons/fa";

const AccountMenu = ({ clikedTab }: any) => {
  const handleTabClick = (data: string) => {
    clikedTab(data);
  };

  return (
    <div className="flex flex-col gap-16 md:gap-5">
      <div
        onClick={() => handleTabClick("pending_review_tab")}
        className="flex items-center gap-1 w-full p-1 rounded-lg hover:bg-pink-300 justify-start"
      >
        <AiOutlineComment className="text-4xl"/>
        <label className="font-semibold hidden md:flex">Reviews</label>
      </div>

      <div
        onClick={() => handleTabClick("ordersTab")}
        className="flex items-center gap-1 w-full p-1 rounded-lg hover:bg-pink-300 justify-start"
      >
        <AiOutlineShopping className="text-4xl"/>
        <label className="font-semibold hidden md:flex">Orders</label>
      </div>

      <div
        onClick={() => handleTabClick("favouriteTab")}
        className="flex items-center gap-1 w-full p-1 rounded-lg hover:bg-pink-300 justify-start"
      >
        <AiOutlineHeart className="text-4xl"/>
        <label className="font-semibold hidden md:flex">Favourite</label>
      </div>

      <div
        className="flex items-center gap-1 w-full p-1 rounded-lg hover:bg-pink-300 justify-start"
        onClick={() => handleTabClick("notifications_tab")}
      >
       <AiOutlineNotification className="text-4xl"/>
        <label className="font-semibold hidden md:flex">Notifications</label>
      </div>

      <div className="md:flex items-center gap-1 w-full p-1 rounded-lg justify-start hidden">
      <AiOutlineUser className="text-4xl"/>
        <label className="font-semibold hidden md:flex">Profile</label>
      </div>

      <div className="flex flex-col md:ms-5 gap-10 md:gap-3">
        <div
          onClick={() => handleTabClick("edit_profile")}
          className="flex justify-start items-center gap-1 w-full p-1 rounded-lg hover:bg-pink-300"
        >
          <AiOutlineEdit className="text-4xl"/>
          <label className="font-semibold hidden md:flex">Edit</label>
        </div>

        <div
          onClick={() => handleTabClick("security")}
          className="flex justify-start items-center gap-1 w-full p-1 rounded-lg hover:bg-pink-300"
        >
          <AiOutlineLock className="text-4xl"/>
          <label className="font-semibold hidden md:flex">Security</label>
        </div>
      </div>
    </div>
  );
};

export default AccountMenu;
