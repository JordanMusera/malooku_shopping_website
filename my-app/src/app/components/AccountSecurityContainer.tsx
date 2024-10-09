import Link from 'next/link'
import React from 'react'

const AccountSecurityContainer = () => {
  return (
    <div className='h-full w-full flex flex-col justify-center items-center gap-5'>
    <div className='w-32 h-32'>
        <img src='user_icon.png' alt='' sizes='full' className='rounded-full bg-gray-200 p-2 border border-pink-300' />
      </div>
        <p>Manage and change your password</p>

        <Link href='/resetPassword' className='bg-pink-300 p-2 rounded-md'>Change Password</Link>
    </div>
  )
}

export default AccountSecurityContainer
