import Image from 'next/image'
import React, { useState } from 'react'

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
  },
  images:any
}

interface ProductImageViewProps {
  product: Product;
}


const ProductImageView: React.FC<ProductImageViewProps> = ({product}) => {
  const [imageIndex,setImageIndex] = useState(0);
  const [images,setImages] = useState(product.images);

  const switchImages=(btn:string)=>{
    if(btn== 'back' && imageIndex>0){
      setImageIndex(imageIndex-1);
    }else if (btn==='forward' && imageIndex<images.length-1) {
      setImageIndex(imageIndex+1);
    }
  }

  return (
    <div className='flex h-screen w-full justify-between items-center p-2 relative'>
      {images.length>1 &&(
<button className='absolute left-0 border border-pink-300 rounded-full w-10 h-10
      text-4xl font-extrabold flex justify-center items-center hover:bg-pink-300 ms-2 bg-white' onClick={()=>switchImages('back')}>
        <img src='/back_icon.svg' alt=''/>
      </button>
      )}
      
  
  <div className='w-full flex justify-center'>
    <img src={product?.images[imageIndex]?.imageUrl} sizes='60' alt=''
      className='xl:h-screen h-auto object-contain pt-14 rounded-xl'/>
  </div>
      
  {images.length>1 &&(
        <button className='absolute right-0 border border-pink-300 rounded-full w-10 h-10
      text-4xl font-extrabold flex justify-center items-center hover:bg-pink-300 ml-2 bg-white' onClick={()=>switchImages('forward')}>
        <img src='/forward_icon.svg' alt=''/>
      </button>
      )}


    </div>
  )
}

export default ProductImageView
