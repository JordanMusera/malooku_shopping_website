"use client";
import { RootState } from "@/store/store";
import Image from "next/image";
import React from "react";
import { useSelector } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/ReactToastify.css";
import { useRouter } from "next/navigation";

const CheckoutCartContainer = () => {
  const router = useRouter();
  const { cartItems, loading, totalAmount } = useSelector(
    (state: RootState) => state.cart
  );

  const { shippingAddress2, paymentMethod } = useSelector(
    (state: RootState) => state.order
  );

  const makePayment = async () => {
    if (!shippingAddress2 || !shippingAddress2.city || !shippingAddress2.county) {
      toast.error("Please select shipping address");
      return;
    }
    if (!paymentMethod || !paymentMethod.accType || !paymentMethod.accNumber) {
      toast.error("Please select a payment method");
      return;
    }

    const loadingToast = toast.loading("Initiating M-Pesa push...") || "";
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shippingAddress: shippingAddress2, paymentMethod }),
        cache: "no-store",
      });

      const response = await res.json();

      if (loadingToast) toast.dismiss(loadingToast);

      if (res.ok && response.success) {
        toast.success(response.message);
        router.push('/');
      } else {
        toast.error(response.message || "Payment failed");
      }
    } catch (error) {
      if (loadingToast) toast.dismiss(loadingToast);
      toast.error("Something went wrong, please try again!");
    }
  };

  return (
    <div className="p-5 h-full">
      <p className="text-md text-black font-bold">Order Summary</p>
      <div className="h-20 w-max flex flex-shrink">
        {cartItems.map((product) => (
          <div key={product.id} className="h-20 cursor-pointer">
            <Image
              src={product.images?.[0]?.imageUrl || "/placeholder.jpg"}
              alt="Product Image"
              width={50}
              height={50}
              className="rounded-md shadow-lg w-12 h-20 object-cover"
            />
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {cartItems.map((product) => (
          <div key={product.id} className="flex text-sm font-semibold items-center gap-2 justify-between">
            <p className="text-gray-800 font-light">{product.title}</p>
            <p className="text-black">{product.price} * {product.orderedQty}</p>
            <p className="text-green-500">${product.productQtyPrice}</p>
          </div>
        ))}
      </div>

      <p className="flex justify-between bg-white shadow-lg rounded-md p-2 my-2">
        <span className="text-md text-black font-bold">Total</span>
        <span className="text-md text-green-500 font-bold">${totalAmount}</span>
      </p>

      <button
        onClick={makePayment}
        className="bg-pink-300 rounded-xl p-2 w-full mt-3 text-lg font-bold text-white hover:shadow-xl"
      >
        Purchase
      </button>

      <div className="my-3">
        <p className="text-[12px] text-gray-400 font-normal w-full justify-center flex">
          Accepted secure payment methods
        </p>
        <div className="flex gap-1 justify-center">
          <img src="/mpesa_logo.svg" alt="M-Pesa" width={35} height={35} />
          <img src="/visa_icon.svg" alt="Visa" width={35} height={35} />
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};

export default CheckoutCartContainer;
