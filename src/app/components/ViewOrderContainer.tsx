"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/ReactToastify.css";

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
}

interface OrderProduct {
  [x: string]: ReactNode;
  product: Product;
  quantity: number;
  productQtyPrice: number;
}

interface Order {
  shippingAddress: {
    postalCode: string;
    street: string;
    city: string;
    county: string;
  };
  paymentMethod: {
    accType: string;
    accNumber: number;
    accName: string;
  };
  deliveryInfo: {
    deliveryType: string;
    pickupStation: string;
  };
  _id: string;
  userId: string;
  products: OrderProduct[];
  totalCost: number;
  status: string;
  orderDate: string;
}

const ViewOrderContainer = ({
  orderObj,
  clickedTab,
  handleCancelAndRefund,
}) => {
  const [refundCtnVisibility, setRefundCtnVisibility] = useState(false);
  const [clickedProduct, setClickedProduct] = useState<OrderProduct>({});
  const router = useRouter();

  const viewProduct = (id: string) => {
    router.push(`/viewProduct/${id}`);
  };

  const cancelAndRefund = (orderProduct: OrderProduct) => {
    if (orderObj.status === "pending") {
      setRefundCtnVisibility(true);
      setClickedProduct(orderProduct);
    } else {
      clickedTab("refund_form_tab");
      const orderDetails = {
        orderId: orderObj._id,
        product: orderProduct,
      };
      handleCancelAndRefund(orderDetails);
    }
  };

  const cancelPendingOrderFn = async (productId: string) => {
    const res = await fetch("/api/orders/refundedOrder", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productId: productId,
        orderId: orderObj._id,
      }),
    });

    const response = await res.json();
    if (response.success) {
      toast.success(response.message);
    } else {
      toast.error(response.message);
    }
  };

  return (
    <div className="w-full h-full relative p-5 xl:p-0">
      <div className="gap-2 flex flex-col">
        {orderObj.products.map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-xl h-max p-3 md:p-5 flex flex-col md:flex-row justify-between items-center w-full gap-1"
          >
            <div className="flex md:justify-between w-full md:w-2/4">
              <Image
                src={item.product.image}
                alt=""
                width={80}
                height={80}
                className="object-cover rounded-xl shadow-lg mr-5"
              />
              <div className="w-max md:w-1/3">
                <p className="text-sm text-black font-bold">
                  {item.product.title}
                </p>
                <p className="text-sm text-gray-600 font-bold flex gap-2">
                  <span>Price:</span>
                  <span className="text-black">${item.product.price}</span>
                </p>
                <p className="text-sm text-gray-600 font-bold flex gap-2">
                  <span>Qty:</span>
                  <span className="text-black">{item.quantity}</span>
                </p>
                <p className="text-sm text-gray-600 font-bold flex gap-2">
                  <span>Cost:</span>
                  <span className="text-black">${item.productQtyPrice}</span>
                </p>
                <p className="text-sm text-gray-600 font-bold flex gap-2">
                  <span>Id:</span>
                  <span className="text-black">{item.product._id}</span>
                </p>
              </div>
            </div>

            <div className="w-full md:w-max flex flex-col gap-2">
              <div className="flex flex-col gap-2">
                <button
                  className="w-full h-max rounded-md p-1 bg-pink-300 font-serif text-white"
                  onClick={() => viewProduct(item.product._id)}
                >
                  View Product
                </button>
                <button
                  className="w-full h-max rounded-md p-1 bg-white border border-pink-300 font-serif text-black hover:bg-red-400"
                  onClick={() => cancelAndRefund(item)}
                >
                  Cancel and refund
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div></div>

      {refundCtnVisibility && (
        <div className="w-full h-full flex items-center justify-center z-20 absolute left-0 top-0 bg-black bg-opacity-20 xl:bg-opacity-10 p-5">
          <div className="w-max md:w-1/3 h-max bg-white rounded-lg shadow-2xl p-5 shadow-pink-200 border-orange-300">
            <div className="flex items-center justify-center gap-2">
              <Image
                src={clickedProduct.product.image}
                alt=""
                width={100}
                height={100}
                className="rounded-xl"
              />
              <div className="text-sm font-semibold">
                <p>{clickedProduct.product.title}</p>
                <p>
                  QTY:<span>{clickedProduct.quantity}</span>
                </p>
              </div>
            </div>

            <div>
              <div className="flex gap-3">
                <button
                  className="font-bold text-black text-md border border-red-400 bg-red-300 w-full p-1 rounded-md hover:bg-red-400"
                  onClick={() => setRefundCtnVisibility(false)}
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="font-bold text-black text-md border border-pink-300 bg-pink-200 w-full p-1 rounded-md hover:bg-pink-300"
                  onClick={() =>
                    cancelPendingOrderFn(clickedProduct.product._id)
                  }
                >
                  Proceed
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default ViewOrderContainer;
