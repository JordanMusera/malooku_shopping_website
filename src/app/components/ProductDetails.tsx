'use client';
import { FiHeart, FiMinus, FiPlus, FiShoppingBag } from "react-icons/fi";
import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/ReactToastify.css";
import CustomerReviewsContainer from "./CustomerReviewsContainer";
import { message } from "antd";
import { useDispatch } from "react-redux";
import { setCart, waitForCartWrites } from "@/store/cartSlice";

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
  const dispatch = useDispatch();
  const [adding,setAdding]=useState(false);
  const [isWish, setIsWish] = useState(false);
  const [qty, setQty] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<{
    [key: string]: string;
  }>({});
  const [selectedProductPrice,setSelectedProductPrice] = useState<number>(product.price)

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
    if(adding)return;setAdding(true);
    try {
      await waitForCartWrites();
      const res=await fetch('/api/cart/user',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({productId:product._id,orderedQty:qty,selectedProductVariants:selectedVariants,selectedProductPrice})});
      const data=await res.json();if(!res.ok || !data.success)throw Error(data.message||'Unable to add this item. Please try again.');
      dispatch(setCart(data));toast.success('Added to your bag');
    }catch(error){toast.error(error instanceof Error?error.message:'Unable to add this item. Please try again.');}
    finally{setAdding(false);}
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

  return (
    <section className="product-detail-panel">
      <span className="eyebrow">{product.category || 'THE MALOOKU COLLECTION'}</span>
      <h1>{product.title}</h1>
      <p className="detail-price"><small>KSh </small>{Number(selectedProductPrice).toLocaleString('en-KE')}</p>
      <p className="detail-description">{product.description}</p>
      <div className="detail-variants">
        {Object.entries((product.variants || {}) as Record<string, any[]>).map(([key, values]) => <div key={key}><p>{key}</p>{values.map((variant, index) => <button key={index} aria-pressed={selectedVariants[key] === variant.value} onClick={() => handleSelection(key, variant)}>{variant.value}</button>)}</div>)}
      </div>
      <div className="detail-quantity">
        <div><p className="text-xs mb-3 text-stone-500">Quantity</p><div className="quantity-control"><button aria-label="Decrease quantity" disabled={qty <= 1} onClick={() => handleQtyFunction('decrement')}><FiMinus /></button><span>{qty}</span><button aria-label="Increase quantity" onClick={() => handleQtyFunction('increment')}><FiPlus /></button></div></div>
        <button className="nav-icon" aria-label={isWish ? 'Remove from wishlist' : 'Add to wishlist'} aria-pressed={isWish} onClick={() => isWish ? removeFromWishlistFunction() : addToWishlistFunction()}><FiHeart fill={isWish ? 'currentColor' : 'none'} /></button>
      </div>
      <button className="shop-button detail-add" disabled={adding} onClick={() => addToCartFunction()}><FiShoppingBag /> {adding ? "Adding..." : "Add to bag"} <span aria-hidden="true">↗</span></button>
      <p className="detail-meta">A good find for your everyday. Make it yours.</p>
      {product.specifications?.length > 0 && <section className="detail-specs"><h2>The details</h2><dl>{product.specifications.map((spec: { specification: string; specificationDescription: string }, index: number) => <div key={index}><dt>{spec.specification}</dt><dd>{spec.specificationDescription}</dd></div>)}</dl></section>}
      <CustomerReviewsContainer productId={product._id} />
      <ToastContainer position="bottom-right" />
    </section>
  );
};

export default ProductDetails;