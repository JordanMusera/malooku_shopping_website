import Image from "next/image";
import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/ReactToastify.css";
import CustomerReviewsContainer from "./CustomerReviewsContainer";
import { message, Table } from "antd";

interface Product {
  _id: string;
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  wish: boolean;
  rating: {
    rate: number;
    count: number;
  };
}

interface ProductDetailsProps {
  product: Product;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ product }:any) => {
  const [isWish, setIsWish] = useState(false);
  const [qty, setQty] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<{
    [key: string]: string;
  }>({});
  const [selectedProductPrice,setSelectedProductPrice] = useState('')

  const handleSelection = (variantType: string, variant: any) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [variantType]: variant.value,
    }));
    setSelectedProductPrice(variant.price);
  };

  useEffect(() => {
    if (product.wish) {
      setIsWish(product.wish);
    }
    setSelectedProductPrice(product.price);
  }, [product]);

  const addToCartFunction = async () => {
    const res = await fetch("/api/cart/user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productId: product._id,
        orderedQty: qty,
        selectedProductVariants:selectedVariants,
        selectedProductPrice:selectedProductPrice
      }),
    });

    const response = await res.json();
    if (response.success) {
      toast.success(response.message);
    } else {
      toast.error(response.message);
    }
  };

  const addToWishlistFunction = async () => {
    const res = await fetch("/api/wishlist", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: product._id,
      }),
    });

    if (res.ok) {
      const response = await res.json();
      if (response.success) {
        message.success(response.message);
        setIsWish(true);
      } else {
        message.error(response.message);
      }
    }
  };

  const removeFromWishlistFunction = async () => {
    const res = await fetch(`/api/wishlist/${product._id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await res.json();
    if (response.success) {
      message.success(response.message);
      setIsWish(false);
    } else {
      message.error(response.message);
    }
  };

  const handleQtyFunction = (action: string) => {
    if (action === "decrement" && qty != 1) {
      setQty((prev) => prev - 1);
    }

    if (action === "increment") {
      setQty((prev) => prev + 1);
    }
  };

  const specsColumns = [
    {
      title: "Specification",
      dataIndex: "specification",
      key: "specification",
    },
    {
      title: "Description",
      dataIndex: "specificationDescription",
      key: "specificationDescription",
    },
  ];

  return (
    <div className="h-full flex items-center justify-center">
      {product ? (
        <div className="flex flex-col p-5 w-full">
          <p className="text-2xl font-bold">{product.title}</p>

          <div className="flex my-3 text-pink-300">
            <p className="text-4xl font-bold">${selectedProductPrice}</p>
          </div>

          <p className="border border-pink-300 rounded-xl p-2 min-h-10">
            {product.description}
          </p>

          <div className="w-full flex flex-col gap-2 mt-2">
            <div className="flex justify-between">
              <div className="flex gap-2 items-center p-1 rounded-md border border-pink-300 w-max">
                <button
                  className="w-10 h-10 text-2xl font-bold hover:text-red-500"
                  onClick={() => handleQtyFunction("decrement")}
                >
                  -
                </button>
                <p className="text-xl font-bold">{qty}</p>
                <button
                  className="w-10 h-10 text-2xl font-bold hover:text-green-500"
                  onClick={() => handleQtyFunction("increment")}
                >
                  +
                </button>
              </div>

              <div>
                {isWish ? (
                  <img
                    src="/favourite_active.png"
                    width={40}
                    height={40}
                    alt=""
                    onClick={() => removeFromWishlistFunction()}
                  />
                ) : (
                  <img
                    src="/favourite_inactive.png"
                    width={40}
                    height={40}
                    alt=""
                    onClick={() => addToWishlistFunction()}
                  />
                )}
              </div>
            </div>

            <div>
              {product.variants && (
                <div className="flex gap-10 flex-shrink">
                {Object.entries(product.variants as Record<any,any[]>).map(([key, values], index) => (
                  <div key={index}>
                    <p className="text-sm font-semibold text-black my-2">
                      {key}
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {values.map((variant, idx) => (
                        <button
                          key={idx}
                          className={`p-2 rounded-md flex items-center justify-center ${
                            selectedVariants[key] === variant.value
                              ? "bg-pink-300 text-white"
                              : "bg-white border border-pink-300"
                          }`}
                          onClick={() => handleSelection(key, variant)}
                        >
                          {variant.value}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              )}
            </div>

            <div className="flex flex-col justify-center items-center w-full gap-2">
              <button
                onClick={() => addToCartFunction()}
                className="text-xl font-bold px-6 py-2 rounded-md bg-pink-300 xl:bg-pink-200 text-white
        hover:bg-pink-300 border border-pink-300 w-full"
              >
                Add to Cart
              </button>
            </div>
          </div>

          <div className="rounded-xl flex flex-col p-2 my-3">
            <Table columns={specsColumns} dataSource={product.specifications} />
          </div>

          <CustomerReviewsContainer productId={product._id} />
        </div>
      ) : (
        <div className="flex justify-center items-center">
          <p>Loading...</p>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default ProductDetails;
