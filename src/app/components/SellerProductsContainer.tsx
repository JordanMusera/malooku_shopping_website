import { Table } from 'antd';
import Image from 'next/image';
import React, { useEffect, useState } from 'react'
import { AiOutlineEdit } from 'react-icons/ai';
import { FaChevronRight, FaEdit, FaPlus, FaProductHunt } from 'react-icons/fa';
import SellerAddProductContainer from './SellerAddProductContainer';

const SellerProductsContainer = () => {
    const [products, setProducts] = useState([]);

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
                <div>
                    <button className='bg-orange-300 p-1 rounded-lg hover:bg-red-400 text-white text-sm font-semibold'>Delete</button>
                </div>
            )
        }
    ]

    return (
        <div className='p-10 flex gap-4 relative'>
            <Table columns={productColumns} dataSource={products} className='w-3/4' />
            <div className='w-1/4 rounded-lg bg-white p-2'>
                <div className='text-md text-black font-semibold bg-pink-200 rounded-lg w-max p-2'>
                    <FaPlus/>
                    <p>Add Product</p>
                </div>
                <hr className='h-2 shadow-xl m-2'/>
            </div>
            <div className='absolute bg-green w-full h-max items-center justify-center'>
                <SellerAddProductContainer/>
            </div>
            
        </div>
    )
}

export default SellerProductsContainer
