import { Table } from 'antd';
import Image from 'next/image';
import React, { useEffect, useState } from 'react'
import { AiOutlineEdit } from 'react-icons/ai';
import { FaChevronRight, FaEdit, FaPlus, FaProductHunt } from 'react-icons/fa';
import SellerAddProductContainer from './SellerAddProductContainer';

const SellerProductsContainer = () => {
    const [products, setProducts] = useState([]);
    const [addProductVisibility, setAddProductVisibility] = useState(false);

    useEffect(() => {
        const fetchProducts = async () => {
            const res = await fetch('/api/products/controller', {
                method: 'GET'
            });

            if (res.ok) {
                const response = await res.json();
                if (response.success) {
                    setProducts(response.content);
                }
            }
        }
        fetchProducts();
    }, []);

    const productColumns = [
        {
            title: 'Image', key: '_id', dataIndex: 'image',
            render: (url) => (
                <div>
                    <Image src={url} alt='image' width={100} height={100} className='w-10 h-10 object-contain' />
                </div>

            )
        },
        { title: 'Title', dataIndex: 'title', key: '_id' },
        { title: 'Product id', dataIndex: '_id', key: '_id' },
        { title: 'Category', dataIndex: 'category', key: '_id' },
        { title: 'Price', dataIndex: 'price', key: '_id' },
        { title: 'Stock', dataIndex: 'stock', key: '_id' },
        {
            title: 'Edit',
            key: 'edit',
            render: () => (
                <div>
                    <AiOutlineEdit className='hover:w-7 hover:h-7 hover:text-pink-300' style={{ fontSize: '25px', cursor: 'pointer' }} />
                </div>
            )
        },
        {
            title: 'Delete',
            key: '_id',
            render: () => (
                <div className='flex items-center'>
                    <button className='bg-orange-300 p-1 rounded-lg hover:bg-red-400 text-white text-sm font-semibold'>Delete</button>
                </div>
            )
        }
    ]

    const addProductVisibilityFn = (visibility: boolean) => {
        setAddProductVisibility(visibility);
    }

    return (
        <div className='h-full p-10 flex gap-4 relative'>
            <div className='h-full w-3/4'>
                <Table columns={productColumns} dataSource={products}  scroll={{ y: 500 }} className='w-full' />
            </div>
            
            <div className='w-1/4 rounded-lg bg-white p-2'>
                <div className='text-md text-black font-semibold bg-pink-200 rounded-lg w-max p-2 hover:cursor-pointer' onClick={()=>addProductVisibilityFn(true)}>
                    <FaPlus />
                    <p>Add Product</p>
                </div>
                <hr className='h-2 shadow-xl m-2' />
            </div>
            {addProductVisibility &&
                <div className='absolute top-0 left-0 bg-green w-full h-max items-center justify-center m-4'>
                    <SellerAddProductContainer setAddProductVisibility={addProductVisibilityFn} />
                </div>
            }


        </div>
    )
}

export default SellerProductsContainer
