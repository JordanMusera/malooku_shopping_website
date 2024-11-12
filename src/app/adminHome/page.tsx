import React from 'react'
import SellerSideBar from '../components/SellerSideBar'
import SellerTopBar from '../components/SellerTopBar'
import SellerOrders from '../components/SellerOrders'

const page = () => {
  return (
    <div className='h-screen bg-white w-screen grid grid-cols-8'>
       <div className='col-span-1 bg-white h-full'>
        <SellerSideBar/>
       </div>
       <div className='col-span-7 h-full'>
        <SellerTopBar/>
        <div className='h-full bg-gray-100 rounded-tl-2xl'>
          <SellerOrders/>
        </div>
       </div>
    </div>
  )
}

export default page
