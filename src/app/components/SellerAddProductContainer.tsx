import React, { useState } from 'react'

const SellerAddProductContainer = () => {
    const [images,setimages] = useState([1,2,3,4]);
  return (
    <div className='w-1/2 h-1/2 bg-white shadow-2xl'>
        <div className='w-full flex gap-4 items-center'>
            {images?.map((item,index)=>( 
                <div key={index}>
                    <img src="/orders_icon.svg" alt="" width={60} height={60} className='object-contain'/>
                </div>
            ))}
            <button className='bg-pink-300 rounded-xl font-semibold p-1 h-max w-max'>Add Image</button>
        </div>

        <div>
           
        </div>
      
    </div>
  )
}

export default SellerAddProductContainer
