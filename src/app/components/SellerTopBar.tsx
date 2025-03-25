import React from 'react'
import { AiOutlineMenu, AiOutlineMenuUnfold } from 'react-icons/ai'
import { FaSearch,FaChevronDown } from 'react-icons/fa'

const SellerTopBar = ({toggleMenuVisibility}:any) => {
  return (
    <div className='bg-pink-200 h-16 w-full flex justify-between gap-6 text-black font-semibold py-1 px-5 items-center'>
      <AiOutlineMenuUnfold className='text-3xl' onClick={toggleMenuVisibility}/>
      <label className='font-extrabold text-2xl text-pink-300 hidden md:flex'>MALOOKU</label>

      <div className='hidden md:flex justify-between w-full'>
         <button>Home</button>
      <button>Orders</button>
      <button>Products</button>
      <button>Customer</button>
      <button>Blog</button>
      <button>Contact</button>

      </div>
     
      <button className='flex gap-2 items-center'>
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
