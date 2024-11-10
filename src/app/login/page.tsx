import React from 'react'
import LoginContainer from '../components/LoginContainer'

const login = () => {
  return (
    <div className='md:grid md:grid-cols-2 w-screen h-screen'>
      <div className='col-span-1 bg-pink-100 h-full md:flex flex-col justify-center items-center p-6 hidden'>
        <label className='font-extrabold text-4xl text-pink-300'>MALOOKU</label>
        <img src="/shopping_girl.png" alt="" sizes='full' className='h-full object-contain' />
      </div>
      <div className='col-span-1 gap-5 justify-center items-center bg-gray-200 w-full h-full flex flex-col'>
      <label className='font-extrabold text-2xl text-pink-300 md:hidden'>MALOOKU WEBSITE</label>
        <LoginContainer/>
      </div>
      
    </div>
  )
}

export default login
