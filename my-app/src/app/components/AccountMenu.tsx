'use client'
import React, { useState } from 'react'

const AccountMenu = ({clikedTab}) => {

    const handleTabClick=(data:string)=>{
        clikedTab(data);
    }
  return (
    <div className='flex flex-col gap-5'>
        <div onClick={()=>handleTabClick('favouriteTab')} className='flex justify-center items-center gap-1 w-max p-1 rounded-lg hover:bg-pink-300'>
            <img src="/user_icon.png" alt="" width={30} height={30}/>
            <label className='font-semibold'>Favourite</label>
        </div>

        <div className='flex justify-center items-center gap-1 w-max p-1 rounded-lg hover:bg-pink-300'>
            <img src="/user_icon.png" alt="" width={30} height={30}/>
            <label className='font-semibold'>Settings</label>
        </div>

        <div className='flex justify-center items-center gap-1 w-max p-1 rounded-lg hover:bg-pink-300'>
            <img src="/user_icon.png" alt="" width={30} height={30}/>
            <label className='font-semibold'>Notifications</label>
        </div>

        <div className='flex justify-center items-center gap-1 w-max p-1 rounded-lg hover:bg-pink-300'>
            <img src="/user_icon.png" alt="" width={30} height={30}/>
            <label className='font-semibold'>Profile</label>
        </div>

        <div className='flex flex-col ms-5 gap-3'>
           <div onClick={()=>handleTabClick("edit_profile")} className='flex justify-center items-center gap-1 w-max p-1 rounded-lg hover:bg-pink-300'>
            <img src="/user_icon.png" alt="" width={30} height={30}/>
            <label className='font-semibold'>Edit</label>
        </div> 

        <div onClick={()=>handleTabClick("security")} className='flex justify-center items-center gap-1 w-max p-1 rounded-lg hover:bg-pink-300'>
            <img src="/user_icon.png" alt="" width={30} height={30}/>
            <label className='font-semibold'>Security</label>
        </div>
        </div>
        
      
    </div>
  )
}

export default AccountMenu
