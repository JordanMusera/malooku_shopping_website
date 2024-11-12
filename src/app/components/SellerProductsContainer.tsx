import {Table } from 'antd';
import Image from 'next/image';
import React, { useEffect, useState } from 'react'
import { AiOutlineEdit } from 'react-icons/ai';
import { FaChevronRight, FaEdit } from 'react-icons/fa';

const SellerProductsContainer = () => {
    const [products,setProducts] = useState([]);

    useEffect(()=>{
        const fetchProducts=async()=>{
            const res = await fetch('/api/products/controller',{
                method:'GET'
            });

            if(res.ok){
                const response = await res.json();
                if(response.success){
                    setProducts(response.content);
                }
            }
        }
        fetchProducts();
    },[]);

    const productColumns=[
        { title:'Image',key:'_id',dataIndex:'image',
            render:(url)=>(
                <div>
                    <Image src={url} alt='image' width={100} height={100} className='w-10 h-10 object-contain'/>
                </div>
                
            )
        },
        { title:'Title',dataIndex:'title',key:'_id' },
        {title:'Product id',dataIndex:'_id',key:'_id'},
        {title:'Category',dataIndex:'category',key:'_id'},
        {title:'Price',dataIndex:'price',key:'_id'},
        {title:'Stock',dataIndex:'stock',key:'_id'},
        {
            title: 'Edit',
            key: 'edit',
            render: () => (
                <div>
                    <AiOutlineEdit style={{ fontSize: '25px', cursor: 'pointer' }} />
                </div>
            )
        }
    ]

  return (
    <div className='p-10'>
      <Table columns={productColumns} dataSource={products}/>
    </div>
  )
}

export default SellerProductsContainer
