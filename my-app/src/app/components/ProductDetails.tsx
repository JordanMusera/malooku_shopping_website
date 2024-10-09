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
};

interface ProductDetailsProps{
  product:Product
}

const ProductDetails: React.FC<ProductDetailsProps> = ({product}) => {

  const addToCartFunction=async()=>{
    console.log("Helllooo")
    const res = await fetch('/api/cart/user/cart',{
      method:'POST',
      headers:{
        'Content-Type':'application/json'
      },
      body:JSON.stringify({
        productId:product.id,
        orderedQty:2
      })
    }
    )
  }

  return (
    <div>
      <div className='flex flex-col'>
        <p className='text-xl font-bold'>Product Name</p>
        <p>{product.description}</p>
        <hr className='m-3'/>

<div className='w-full flex flex-col gap-6 xl:gap-0 xl:grid xl:grid-cols-4'>
    <div className='xl:col-span-2 flex flex-col justify-center items-center'>
        <div className='flex gap-3 m-3'>
            <p className='text-lg font-bold'>Price</p>
            <p className='text-lg'>{product.price}</p>
        </div>

        <button onClick={()=>addToCartFunction()}
        className='text-xl font-bold px-6 py-2 rounded-xl bg-pink-300 text-white
        hover:bg-pink-500'>Add to Cart</button>
    </div>
    <div className='rounded-xl h-60 bg-slate-200 m-3 flex flex-col p-2 xl:col-span-2'>
        <p className='text-sm font-bold'>Specifications</p>
        <hr className='h-1 bg-pink-300'/>
        </div>
</div>
        
      </div>
    </div>
  )
}

export default ProductDetails
