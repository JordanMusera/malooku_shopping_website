import Image from "next/image";
import React, { useEffect, useState } from "react";

const PendingReview = ({ clickedTab, productId }: any) => {
  const [pendingReviewObj, setPendingReviewObj] = useState([]);

  const handleClickedTab = (tab: string) => {
    clickedTab(tab);
  };

  useEffect(() => {
    const fetchPendingReview = async () => {
      const res = await fetch("/api/orders/purchasedOrders");
      const response = await res.json();

      const pendingReviewList = response.content.filter(
        (item: any) => item.reviewed === false
      );
      setPendingReviewObj(pendingReviewList);
    };
    fetchPendingReview();
  }, []);

  const navigateToReview = (productId1: string) => {
    clickedTab("review_tab");
    productId(productId1);
  };

  return (
    <div className="gap-2 flex flex-col w-full h-full p-3 md:p-5 relative">
      <div className="top-0 w-full md:w-max h-9 justify-between flex gap-3">
        <button
          className="w-full text-md text-black font-semibold border border-pink-300 bg-pink-300 rounded-md px-2"
          onClick={() => handleClickedTab("pending_review_tab")}
        >
          Pending
        </button>
        <button
          className="w-full text-md text-black font-semibold border border-pink-300 bg-white rounded-md px-2"
          onClick={() => handleClickedTab("reviewed_tab")}
        >
          Reviewed
        </button>
      </div>

      <div className="flex flex-col-reverse gap-2 overflow-auto pt-5 justify-between">
        {pendingReviewObj &&
          pendingReviewObj.map((item, index) => (
            <div
              key={index}
              className="bg-white h-max w-full rounded-sm shadow-lg p-5 flex md:flex-row items-center justify-between md:gap-6"
              onClick={() => navigateToReview(item.productId)}
            >
              <div className="flex gap-2 justify-between items-center w-full md:w-1/2">
                <Image
                  src={item.product.image}
                  alt=""
                  width={80}
                  height={80}
                />
                <div className="flex flex-col gap-2 w-full px-10">
                  <div className="flex justify-end md:justify-start">
                    <p className="px-1 bg-gray-300 rounded-md w-max">
                      {item.status}
                    </p>
                  </div>
                  <p className="text-black font-semibold text-sm w-full">
                    {item.product.title}
                  </p>
                  <p className="text-gray-700 text-sm font-semibold">
                    #{item.productId}
                  </p>
                </div>
              </div>

              
            </div>
          ))}
      </div>
    </div>
  );
};

export default PendingReview;
