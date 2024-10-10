'use client'
import React, { useEffect, useState } from 'react'
import AccountMenu from '../components/AccountMenu'
import AccountProfileContainer from '../components/EditProfileContainer'
import AccountSecurityContainer from '../components/AccountSecurityContainer'

const page = () => {
    const[tab,setTab] = useState("edit_profile")

    const handleTabClick=(data:string)=>{
        setTab(data);
        console.log("Clicked_tab: "+data)
    }

  return (
    <div className='grid grid-cols-6 h-screen w-screen'>
        <div className='h-full  col-span-1 flex flex-col justify-center items-center bg-white'>
            <AccountMenu clikedTab={handleTabClick}/>
        </div>

        <div className='col-span-4 h-full'>
            {tab==="edit_profile" &&(
                 <AccountProfileContainer/>
            )}

            {tab=="security" &&(
                <AccountSecurityContainer/>
            )}

        </div>

        <div className='col-span-1 bg-gray-200 h-full'>
        
        </div>
      
    </div>
  )
}

export default page
