import { message, Table, Modal, Popconfirm } from "antd";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { AiOutlineEdit } from "react-icons/ai";
import { FaPlus } from "react-icons/fa";
import SellerAddProductContainer from "./SellerAddProductContainer";

const SellerProductsContainer = () => {
  const [products, setProducts] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [reload, setReload] = useState(0);
  const [addProductVisibility, setAddProductVisibility] = useState(false);
  const [clickedProduct, setClickedProduct] = useState(null);

  useEffect(() => {
    let active = true;
    const fetchProducts = async () => {
      setLoading(true);
      setLoadError(false);
      try {
        const res = await fetch("/api/products/controller", { method: "GET" });
        const response = await res.json();
        if (!res.ok || !response.success || !Array.isArray(response.content)) throw new Error("Unable to load products");
        if (active) setProducts(response.content);
      } catch {
        if (active) setLoadError(true);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchProducts();
    return () => { active = false; };
  }, [reload]);

  const productColumns = [
    {
      title: "Image",
      key: "_id",
      dataIndex: "image",
      render: (_: unknown, record: any) => {
        const imageUrl = record.images?.[0]?.imageUrl || record.image;
        return imageUrl ? <Image src={imageUrl} alt={record.title || "Product"} width={100} height={100} className="w-10 h-10 object-contain" /> : <span className="admin-product-image-empty">No image</span>;
      },
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
    setProducts((prev: any[]) => {
      const exists = prev.some((item: any) => item._id === product._id);
      return exists ? prev.map((item: any) => item._id === product._id ? product : item) : [product, ...prev];
    });
  };


  const deleteProduct=async(productId:string)=>{
    try {
      const res = await fetch(`/api/products/controller?productId=${productId}`, { method:'DELETE' });
      const response = await res.json();
      if (!res.ok || !response.success) throw new Error(response.message || "Unable to delete product.");
      setProducts((prevProducts:any)=>prevProducts.filter((item:any)=>item._id!==productId));
      message.success(response.message || "Product deleted.");
    } catch (error) {
      message.error(error instanceof Error ? error.message : "Unable to delete product. Please try again.");
    }
  }

  return <section className="admin-card admin-data-section">
    <div className="admin-card-heading"><div><h2>Product collection</h2><p>{products.length} products in your store</p></div><button className="admin-primary" onClick={()=>addProductVisibilityFn(true)}><FaPlus/> Add product</button></div>
    {loadError ? <div className="admin-products-state" role="alert"><h3>Products could not be loaded</h3><p>Check your connection and try again.</p><button className="admin-primary" onClick={()=>setReload(value=>value+1)}>Try again</button></div> : !loading && products.length === 0 ? <div className="admin-products-state"><h3>Your collection is ready to begin</h3><p>Add your first product to make it available in the store.</p><button className="admin-primary" onClick={()=>addProductVisibilityFn(true)}><FaPlus/> Add your first product</button></div> : <Table loading={loading} columns={productColumns} dataSource={products} rowKey="_id" scroll={{x:780}} pagination={{pageSize:8,showSizeChanger:false}}/>}
    <Modal title={clickedProduct?'Edit product':'Add product'} open={addProductVisibility || !!clickedProduct} onCancel={()=>addProductVisibilityFn(false)} footer={null} width={760} destroyOnClose className="admin-product-modal">
      <SellerAddProductContainer setAddProductVisibility={addProductVisibilityFn} clickedProduct={clickedProduct} updatedProducts={updateProductList}/>
    </Modal>
  </section>;
};
export default SellerProductsContainer;
