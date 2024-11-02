'use client'
import React, { useState } from 'react'

const AccountMenu = ({clikedTab}) => {

    const handleTabClick=(data:string)=>{
        clikedTab(data);
    }
  return (
    <div className='flex flex-col gap-10 md:gap-5'>
        <div onClick={()=>handleTabClick('reviewed_tab')} className='flex items-center gap-1 w-full p-1 rounded-lg hover:bg-pink-300 justify-start'>
            <img src="/review_icon.png" alt="" width={30} height={30}/>
            <label className='font-semibold hidden md:flex'>Orders</label>
        </div>

         <div onClick={()=>handleTabClick('ordersTab')} className='flex items-center gap-1 w-full p-1 rounded-lg hover:bg-pink-300 justify-start'>
            <img src="/orders_icon.svg" alt="" width={30} height={30}/>
            <label className='font-semibold hidden md:flex'>Orders</label>
        </div>

        <div onClick={()=>handleTabClick('favouriteTab')} className='flex items-center gap-1 w-full p-1 rounded-lg hover:bg-pink-300 justify-start'>
            <img src="/favourite_icon.svg" alt="" width={30} height={30}/>
            <label className='font-semibold hidden md:flex'>Favourite</label>
        </div>

        <div className='flex items-center gap-1 w-full p-1 rounded-lg hover:bg-pink-300 justify-start'>
            <img src="/settings_icon.svg" alt="" width={30} height={30}/>
            <label className='font-semibold hidden md:flex'>Settings</label>
        </div>

        <div className='flex items-center gap-1 w-full p-1 rounded-lg hover:bg-pink-300 justify-start'
        onClick={()=>handleTabClick('notifications_tab')}>
            <img src="/notification_icon.svg" alt="" width={30} height={30}/>
            <label className='font-semibold hidden md:flex'>Notifications</label>
        </div>

        <div className='md:flex items-center gap-1 w-full p-1 rounded-lg justify-start hidden'>
            <img src="/profile_icon.svg" alt="" width={30} height={30}/>
            <label className='font-semibold hidden md:flex'>Profile</label>
        </div>

        <div className='flex flex-col md:ms-5 gap-10 md:gap-3'>
           <div onClick={()=>handleTabClick("edit_profile")} className='flex justify-start items-center gap-1 w-full p-1 rounded-lg hover:bg-pink-300'>
            <img src="/edit_icon.svg" alt="" width={30} height={30}/>
            <label className='font-semibold hidden md:flex'>Edit</label>
        </div> 

        <div onClick={()=>handleTabClick("security")} className='flex justify-start items-center gap-1 w-full p-1 rounded-lg hover:bg-pink-300'>
            <img src="/security_icon.svg" alt="" width={30} height={30}/>
            <label className='font-semibold hidden md:flex'>Security</label>
        </div>
        </div>
        
      
    </div>
  )
}

export default AccountMenu
