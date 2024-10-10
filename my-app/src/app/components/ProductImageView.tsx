import Image from 'next/image'
import React from 'react'

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

interface ProductImageViewProps {
  product: Product;
}


const ProductImageView: React.FC<ProductImageViewProps> = ({product}) => {
  return (
    <div className='flex h-screen w-full justify-between items-center p-2 relative'>
      <button className='absolute left-0 border border-pink-300 rounded-full w-10 h-10
      text-4xl font-extrabold flex justify-center items-center hover:bg-pink-300 ms-2 bg-white'>
        <img src='/back_icon.svg' alt=''/>
      </button>
  
  <div className='w-full flex justify-center'>
    <img src={product.image} sizes='60' alt=''
      className='xl:h-screen h-auto object-contain pt-14 rounded-xl'/>
  </div>
      

<button className='absolute right-0 border border-pink-300 rounded-full w-10 h-10
      text-4xl font-extrabold flex justify-center items-center hover:bg-pink-300 ml-2 bg-white'>
        <img src='/forward_icon.svg' alt=''/>
      </button>
    </div>
  )
}

export default ProductImageView
