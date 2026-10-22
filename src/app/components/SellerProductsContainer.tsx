import { message, Table, Modal, Popconfirm } from "antd";
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

    { title: "Category", dataIndex: "category", key: "_id" },
    { title: "Price", dataIndex: "price", key: "price", render: (value:number) => `KSh ${Number(value || 0).toLocaleString()}` },
    { title: "Stock", dataIndex: "qty", key: "_id" },
    {
      title: "Edit",
      key: "_id",
      render: (record: any) => (
        <div>
          <button className="admin-text-button" aria-label={`Edit ${record.title}`} onClick={()=>setClickedProduct(record)}><AiOutlineEdit/> Edit</button>
        </div>
      ),
    },
    {
      title: "Delete",
      key: "_id",
      render: (record:any) => (
        <div className="flex items-center">
          <Popconfirm title="Delete this product?" description="This removes the product from your store." onConfirm={()=>deleteProduct(record._id)} okText="Delete" cancelText="Keep product"><button className="admin-delete">Delete</button></Popconfirm>
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

  return <section className="admin-card admin-data-section">
    <div className="admin-card-heading"><div><h2>Product collection</h2><p>{products.length} products in your store</p></div><button className="admin-primary" onClick={()=>addProductVisibilityFn(true)}><FaPlus/> Add product</button></div>
    <Table columns={productColumns} dataSource={products} rowKey="_id" scroll={{x:780}} pagination={{pageSize:8,showSizeChanger:false}}/>
    <Modal title={clickedProduct?'Edit product':'Add product'} open={addProductVisibility || !!clickedProduct} onCancel={()=>addProductVisibilityFn(false)} footer={null} width={760} destroyOnClose className="admin-product-modal">
      <SellerAddProductContainer setAddProductVisibility={addProductVisibilityFn} clickedProduct={clickedProduct} updatedProducts={updateProductList}/>
    </Modal>
  </section>;
};
export default SellerProductsContainer;
