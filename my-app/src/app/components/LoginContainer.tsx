import React from 'react'

const LoginContainer = () => {
  return (
    <div className='w-3/4 p-3 rounded-lg bg-pink-300 h-max flex flex-col text-black gap-1'>
        <label className='flex justify-center w-full font-bold text-xl text-white'>LOGIN PAGE</label>
        <label>Email</label>
      <input type='email' placeholder='Enter email' className='rounded h-10 px-2'/>
      <label>Password</label>
      <input type='password' placeholder='Enter email' className='rounded h-10 px-2'/>
      <p><span className='text-black font-md'>Forgot password? </span><span className='text-blue-500 font-semibold text-md'>Reset</span></p>
      <button className='bg-gray-500 w-full h-10 text-xl text-white font-bold flex justify-center items-center rounded-md my-2'>LOGIN</button>
      <p><span className='text-black font-md'>Don't have an account? </span><span className='text-blue-500 font-semibold text-md'>Sign up</span></p>
    </div>
  )
}

export default LoginContainer
