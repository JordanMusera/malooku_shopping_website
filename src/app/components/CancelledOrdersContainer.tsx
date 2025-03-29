"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

interface Product {
  rating: {
    rate: number;
    count: number;
  };
  _id: string;
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  images:any;
}

interface CancelledOrders {
  _id: string;
  userId: string;
  productId: string;
  orderId: string;
  status: string;
  product: Product;
  quantity: number;
  productQtyPrice: number;
  cancellationDate: string;
}

const CancelledOrdersContainer = ({ clickedTab }:any) => {
  const [cancelledOrders, setCancelledOrders] = useState<CancelledOrders[]>([]);
  const router = useRouter();

  const handleClickedTab = (tab: string) => {
    clickedTab(tab);
  };

  const navigateToViewProduct = (productId: string) => {
    router.push(`/viewProduct/${productId}`);
  };

  useEffect(() => {
    const fetchCancelledOrders = async () => {
      const res = await fetch("/api/orders/cancelledOrder");
      const response = await res.json();
      setCancelledOrders(response);
    };
    fetchCancelledOrders();
  }, []);

  return (
    <div className="gap-2 flex flex-col w-full h-full p-3 md:p-5 relative">
      <div className="top-0 w-full md:w-max h-10 justify-between flex md:px-5 gap-2">
        <button
          className="text-md w-full text-black font-semibold bg-white border-pink-300 rounded-md px-2"
          onClick={() => handleClickedTab("ordersTab")}
        >
          Orders
        </button>
        <button
          className="text-md w-full text-black font-semibold border border-pink-300 bg-pink-300 rounded-md px-2"
          onClick={() => handleClickedTab("cancelled_orders_tab")}
        >
          Cancelled
        </button>
        <button
          className="text-md w-full text-black font-semibold border border-pink-300 bg-white rounded-md px-2"
          onClick={() => handleClickedTab("refunds_tab")}
        >
          Refunds
        </button>
      </div>

      <div className="flex flex-col gap-2 overflow-auto">
        {cancelledOrders &&
          cancelledOrders.map((item, index) => (
            <div
              key={index}
              className="bg-white h-max w-full rounded-lg shadow-lg p-5 flex flex-col md:flex-row items-center justify-between md:gap-6"
            >
              <div className="flex gap-2 justify-between items-center md:w-1/2">
                <Image
                  src={item.product.images[0].imageUrl}
                  alt=""
                  width={100}
                  height={100}
                />
                <div className="flex flex-col gap-2 relative">
                  <div className="flex justify-end md:justify-start">
                    <p className="px-1 bg-orange-300 rounded-md w-max">
                      {item.status}
                    </p>
                  </div>
                  <p className="text-black font-semibold text-sm">
                    {item.product.title}
                  </p>
                  <p className="text-gray-700 text-sm">
                    {item.cancellationDate}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 justify-between items-center md:w-1/2">
                <div className="flex flex-col gap-3 justify-center">
                  <p className="text-black text-sm font-medium">
                    {item.product.price} * {item.quantity}
                  </p>
                  <p className="text-green-500 text-xl font-semibold">
                    ${item.productQtyPrice}
                  </p>
                </div>
                <div className="flex flex-col w-max gap-4">
                  <p className="text-gray-700 text-sm font-semibold">
                    Id: {item.productId}
                  </p>
                  <button
                    className="border border-pink-300 rounded-lg w-full text-black p-1"
                    onClick={() => navigateToViewProduct(item.productId)}
                  >
                    View Product
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default CancelledOrdersContainer;
