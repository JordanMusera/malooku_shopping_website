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
    <div className='flex flex-col xl:flex-row'>
      <img src={product.image} sizes='full' alt=''
      className='xl:h-screen h-auto object-cover pt-14'/>

      <div className='flex xl:flex-col h-screen overflow-auto pt-14'>
      <img src={product.image} sizes='full' alt=''
      className='w-40 object-contain'/>
      <img src={product.image} sizes='full' alt=''
      className='w-40 object-contain'/>
      <img src={product.image} sizes='full' alt=''
      className='w-40 object-contain'/>
      </div>
    </div>
  )
}

export default ProductImageView
