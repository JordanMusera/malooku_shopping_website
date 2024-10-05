import React from 'react'

const ProductDetails = () => {
  return (
    <div>
      <div className='flex flex-col'>
        <p className='text-xl font-bold'>Product Name</p>
        <p>Slim-fitting style, contrast raglan long sleeve, three-button henley placket, light weight & soft fabric for breathable and comfortable wearing. And Solid stitched shirts with round neck made for durability and a great fit for casual fashion wear and diehard baseball fans. The Henley style round neckline includes a three-button placket.</p>
        <hr className='m-3'/>

<div className='w-full grid grid-cols-4'>
    <div className='col-span-2 flex flex-col justify-center items-center'>
        <div className='flex gap-3 m-3'>
            <p className='text-lg font-bold'>Price</p>
            <p className='text-lg'>$100</p>
        </div>

        <button 
        className='text-xl font-bold px-6 py-2 rounded-xl bg-pink-300 text-white
        hover:bg-pink-500'>Add to Cart</button>
    </div>
    <div className='rounded-xl h-60 bg-slate-200 m-3 flex flex-col p-2 col-span-2'>
        <p className='text-sm font-bold'>Specifications</p>
        <hr className='h-1 bg-pink-300'/>
        </div>
</div>
        
      </div>
    </div>
  )
}

export default ProductDetails
