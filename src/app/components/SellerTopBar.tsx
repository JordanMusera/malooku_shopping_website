import React from 'react'
import { FaSearch,FaChevronDown } from 'react-icons/fa'

const SellerTopBar = () => {
  return (
    <div className='bg-white h-16 w-full flex justify-between gap-6 text-black font-semibold py-1 px-10 '>
      <div className='flex justify-between items-center bg-gray-100 w-1/4 h-full border-pink-300 border rounded-2xl'>
        <input type='text' placeholder='Search here' className='w-full bg-gray-100 rounded-s-2xl p-2'/>
        <FaSearch className='w-4 h-4 mx-2'/>
      </div>
      
      <button>Home</button>
      <button>Orders</button>
      <button>Products</button>
      <button>Customer</button>
      <button>Blog</button>
      <button>Contact</button>

      <button className='flex gap-2 items-center justify-end'>
        <div className='h-10 w-10 rounded-full bg-pink-100 flex items-center justify-center'>
          <img src="/user_icon.png" alt="" width={30} height={30} className='object-contain'/>
        </div>
        <div className='text-start text-sm'>
          <p className='text-black'>jordan Musera</p>
          <p className='text-gray-600'>Admin</p>
        </div>
        <FaChevronDown/>
      </button>
    </div>
  )
}

export default SellerTopBar
