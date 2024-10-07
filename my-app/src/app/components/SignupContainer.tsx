'use client'
import React, { useState } from 'react'

const SignupContainer = () => {
    const[username,setUsername] = useState('');
    const[email,setEmail] = useState('');
    const[password,setPassword] = useState('');
    
    const loginFunction=async()=>{
    const res = await fetch('/api/authenticate/signup',{
        method:'POST',
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify({
            username:username,
            userEmail:email,
            userPassword:password
        })
    
    })
    }

  return (
    <form className='w-3/4 p-3 rounded-lg bg-pink-300 h-max flex flex-col text-black gap-1'>
    <label className='flex justify-center w-full font-bold text-xl text-white'>SIGNUP PAGE</label>
    <label>Username</label>
  <input type='email' placeholder='Enter username' className='rounded h-10 px-2'
  onChange={e=>setUsername(e.target.value)}/>
    <label>Email</label>
  <input type='email' placeholder='Enter email' className='rounded h-10 px-2'
  onChange={e=>setEmail(e.target.value)}/>
  <label>Password</label>
  <input type='password' placeholder='Enter password' className='rounded h-10 px-2'
  onChange={e=>setPassword(e.target.value)}/>
  <p><span className='text-black font-md'>Forgot password? </span><span className='text-blue-500 font-semibold text-md'>Reset</span></p>
  <button className='bg-gray-400 w-full h-10 text-xl text-white font-bold flex justify-center items-center rounded-md my-2'
  onClick={()=>loginFunction()}>SIGN UP</button>
  <p><span className='text-black font-md'>Don't have an account? </span><span className='text-blue-500 font-semibold text-md'>Sign up</span></p>
</form>
)
}

export default SignupContainer