import React from 'react'
import { MdOutlineDashboard,MdOutlineShoppingBag,MdOutlinePayment,MdOutlineSettings,MdOutlineLogout,MdOutlineEventSeat, MdOutlineEvent } from 'react-icons/md'
import { FaBoxOpen } from 'react-icons/fa'
import { AiOutlineUser,AiOutlineProfile,AiOutlineOrderedList } from 'react-icons/ai'

const sellerSideBar = ({clickedTab}:any) => {

  const handleTabClick=(tab:string)=>{
    clickedTab(tab);
  }

  return (
    <div className='w-full h-full flex flex-col justify-between py-5 mx-10 text-md text-black font-semibold'>
      <label className='font-extrabold text-2xl text-pink-300'>MALOOKU</label>
      <button className='flex gap-1 items-center'>
        <MdOutlineDashboard className='w-7 h-7'/>
        <p>Dashboard</p>
      </button>
      <button className='flex gap-1 items-center' onClick={()=>handleTabClick('ordersTab')}>
        <MdOutlineShoppingBag className='w-7 h-7'/>
        <p>Orders</p>
      </button>

      <button className='flex gap-1 items-center' onClick={()=>handleTabClick('productsTab')}>
        <FaBoxOpen className='w-7 h-7'/>
        <p>Products</p>
      </button>

      <button className='flex gap-1 items-center'>
        <AiOutlineUser className='w-7 h-7'/>
        <p>Customers</p>
      </button>

      <button className='flex gap-1 items-center'>
        <MdOutlinePayment className='w-7 h-7'/>
        <p>Payments</p>
      </button>

      <button className='flex gap-1 items-center'>
        <MdOutlineEvent className='w-7 h-7'/>
        <p>Events</p>
      </button>

      <button className='flex gap-1 items-center'>
        <AiOutlineOrderedList className='w-7 h-7'/>
        <p>Constants</p>
      </button>

      <button className='flex gap-1 items-center'>
        <MdOutlineSettings className='w-7 h-7'/>
        <p>Settings</p>
      </button>

      <button className='flex gap-1 items-center'>
        <AiOutlineProfile className='w-7 h-7'/>
        <p>My profile</p>
      </button>

      <button className='flex gap-1 items-center'>
        <MdOutlineLogout className='w-7 h-7'/>
        <p>Logout</p>
      </button>

    </div>
  )
}

export default sellerSideBar
