import { message, Table } from "antd";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { AiOutlineEdit } from "react-icons/ai";
import { FaChevronRight, FaEdit, FaPlus, FaProductHunt } from "react-icons/fa";
import SellerAddProductContainer from "./SellerAddProductContainer";

const SellerProductsContainer = () => {
  const [products, setProducts] = useState<any>([]);
  const [addProductVisibility, setAddProductVisibility] = useState(false);
  const [clickedProduct, setClickedProduct] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      const res = await fetch("/api/products/controller", {
        method: "GET",
      });

      if (res.ok) {
        const response = await res.json();
        if (response.success) {
          setProducts(response.content);
        }
      }
    };
    fetchProducts();
  }, []);

  const productColumns = [
    {
      title: "Image",
      key: "_id",
      dataIndex: "image",
      render: (url: string) => (
        <div>
          <Image
            src={url}
            alt="image"
            width={100}
            height={100}
            className="w-10 h-10 object-contain"
          />
        </div>
      ),
    },
    { title: "Title", dataIndex: "title", key: "_id" },
    { title: "Product id", dataIndex: "_id", key: "_id" },
    { title: "Category", dataIndex: "category", key: "_id" },
    { title: "Price", dataIndex: "price", key: "_id" },
    { title: "Stock", dataIndex: "stock", key: "_id" },
    {
      title: "Edit",
      key: "_id",
      render: (record: any) => (
        <div>
          <AiOutlineEdit
            className="hover:w-7 hover:h-7 hover:text-pink-300"
            style={{ fontSize: "25px", cursor: "pointer" }}
            onClick={() => setClickedProduct(record)}
          />
        </div>
      ),
    },
    {
      title: "Delete",
      key: "_id",
      render: (record:any) => (
        <div className="flex items-center">
          <button className="bg-orange-300 p-1 rounded-lg hover:bg-red-400 text-white text-sm font-semibold" onClick={()=>deleteProduct(record._id)}>
            Delete
          </button>
        </div>
      ),
    },
  ];

  const addProductVisibilityFn = (visibility: boolean) => {
    setAddProductVisibility(visibility);
    if (!visibility) {
      setClickedProduct(null);
    }
  };

  const updateProductList = (product: any) => {
    const productIndex = products.findIndex((item: any) => item._id === product._id);
    if (productIndex !== -1) {
        const updatedProducts = [...products];
        updatedProducts[productIndex] = product;
        setProducts(updatedProducts);
    } else {
        setProducts((prev:any)=>[...prev,product])
        message.success("Product added!");
    }
};


  const deleteProduct=async(productId:string)=>{
    const res = await fetch(`/api/products/controller?productId=${productId}`,{
        method:'DELETE'
    })
    if(res.ok){
        const response = await res.json();
        if(response.success){
            setProducts((prevProducts:any)=>prevProducts.filter((item:any)=>item._id!==productId));
            message.success(response.message);
        }else{
            message.error(response.message);
        }
    }
  }

  return (
    <div className="h-full p-10 flex gap-4 relative">
      <div className="h-full w-3/4">
        <Table
          columns={productColumns}
          dataSource={products}
          scroll={{ y: 500 }}
          className="w-full"
        />
      </div>

      <div className="w-1/4 rounded-lg bg-white p-2">
        <div
          className="text-md text-black font-semibold bg-pink-200 rounded-lg w-max p-2 hover:cursor-pointer"
          onClick={() => addProductVisibilityFn(true)}
        >
          <FaPlus />
          <p>Add Product</p>
        </div>
        <hr className="h-2 shadow-xl m-2" />
      </div>
      {(addProductVisibility || clickedProduct) && (
        <div className="absolute top-0 left-0 bg-green w-full h-max items-center justify-center m-4">
          <SellerAddProductContainer
            setAddProductVisibility={addProductVisibilityFn}
            clickedProduct={clickedProduct}
            updatedProducts={updateProductList}
          />
        </div>
      )}
    </div>
  );
};

export default SellerProductsContainer;
