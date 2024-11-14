'use client'
import React, { useState } from 'react'
import SellerSideBar from '../components/SellerSideBar'
import SellerTopBar from '../components/SellerTopBar'
import SellerOrders from '../components/SellerOrders'
import SellerProductsContainer from '../components/SellerProductsContainer'
import SellerUsersContainer from '../components/SellerUsersContainer'

const page = () => {
  const [clickedTab,setClickedTab] = useState('');

  const handleClickedTab=(tab:string)=>{
    setClickedTab(tab);
  }

  return (
    <div className='h-screen bg-white w-screen flex'>
  <div className='col-span-1 bg-white h-full'>
    <SellerSideBar clickedTab={handleClickedTab}/>
  </div>
  <div className='flex-1 flex flex-col'>
    <SellerTopBar/>
    <div className='bg-gray-100 rounded-tl-2xl flex-grow overflow-auto'>
      {clickedTab==='ordersTab' && <SellerOrders/>}
      {clickedTab ==='productsTab' && <SellerProductsContainer/>}
      {clickedTab ==='usersTab' && <SellerUsersContainer/>} 
      
    </div>
  </div>
</div>

  )
}

export default page
