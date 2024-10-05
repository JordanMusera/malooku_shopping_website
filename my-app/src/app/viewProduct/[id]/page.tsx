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
        
        <div className='grid grid-cols-2'>
            <div className='col-span-1 bg-slate-200'>
                <ProductImageView product={product}/>
            </div>

            <div className='col-span-1 bg-pink-50 pt-14'>
                <ProductDetails product={product}/>
            </div>
            
      
        </div>
      
    </div>
  )
}

export default page
