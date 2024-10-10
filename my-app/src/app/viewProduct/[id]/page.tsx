'use client'
import React, { useEffect, useState } from 'react'
import ProductImageView from '../../components/ProductImageView'
import Topbar from '../../components/Topbar'
import ProductDetails from '../../components/ProductDetails'
import { useParams } from 'next/navigation'

interface Product {
    _id:string,
    id:number,
    title:string,
    price:number,
    description:string,
    category:string,
    image:string,
    rating:{
        rate:number,
        count:number
    }
}

const page = () => {
    const [product,setProduct] = useState({});
    const { id } = useParams();

    useEffect(()=>{
        const fetchProduct=async()=>{
            if(id){
                const res = await fetch(`/api/products/${id}`);
                if(res.ok){
                    const product1 = await res.json();
                    setProduct(product1)
                }
            
            }
            
        }

        fetchProduct();
    },[id])

  return (
    <div className='flex flex-col'>
        <div className='fixed z-10 top-0 w-full shadow-xl'>
            <Topbar/>
        </div>
        
        <div className='xl:grid xl:grid-cols-2 flex flex-col'>
            <div className='xl:col-span-1 bg-white'>
                <ProductImageView product={product}/>
            </div>

            <div className='xl:col-span-1 bg-white pt-14'>
                <ProductDetails product={product}/>
            </div>
            
      
        </div>
      
    </div>
  )
}

export default page
