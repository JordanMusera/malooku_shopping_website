'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

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


const HomeProducts = () => {
    const [products,setProducts] = useState<Product[]>([]);
    const router = useRouter();

    useEffect(()=>{
        const fetchData = async()=>{
            const res = await fetch('/api/products');
            const products:Product[] = await res.json();
            setProducts(products);
        }
        fetchData();
    },[]);

    const productClicked = (product:Product) => {
      router.push(`/viewProduct/${product._id}`);
    };
  return (
    <div className='grid grid-cols-4 gap-5 w-full justify-center px-3'>
      {products.map(product=>(
        <div key={product.id} className='rounded-xl bg-slate-100 border border-pink-300' onClick={()=>productClicked(product)}>
            <Image 
            src={product.image}
            alt=''
            width={100}
            height={100}
            className='rounded'/>
            <p className='text-bold'>{product.title}</p>
            <p>{product.price}</p>
        </div>
      ))}
    </div>
  )
}

export default HomeProducts
