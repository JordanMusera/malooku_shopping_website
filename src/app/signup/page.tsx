import React from 'react'
import SignupContainer from '../components/SignupContainer'

const page = () => {
  return (
    <div className='md:grid md:grid-cols-2 w-screen h-screen'>
    <div className='col-span-1 bg-pink-100 h-full hidden md:flex flex-col justify-center items-center p-6'>
      <label className='font-extrabold text-4xl text-pink-300'>MALOOKU</label>
      <img src="/shopping_girl.png" alt="" sizes='full' className='h-full object-contain' />
    </div>
    <div className='col-span-1 flex flex-col gap-5 justify-center items-center bg-gray-200 w-full h-full'>
    <label className='font-extrabold text-2xl text-pink-300'>MALOOKU WEBSITE</label>
      <SignupContainer/>
    </div>
    
  </div>
  )
}

export default page
