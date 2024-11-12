import React from 'react'
import SellerSideBar from '../components/SellerSideBar'
import SellerTopBar from '../components/SellerTopBar'
import SellerOrders from '../components/SellerOrders'

const page = () => {
  return (
    <div className='h-screen bg-white w-screen flex'>
  <div className='col-span-1 bg-white h-full'>
    <SellerSideBar/>
  </div>
  <div className='flex-1 flex flex-col'>
    <SellerTopBar/>
    <div className='bg-gray-100 rounded-tl-2xl flex-grow overflow-auto'>
      <SellerOrders/>
    </div>
  </div>
</div>

  )
}

export default page
