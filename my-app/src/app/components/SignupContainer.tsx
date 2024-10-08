'use client'
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SignupContainer = () => {
    const[username,setUsername] = useState('');
    const[email,setEmail] = useState('');
    const[password,setPassword] = useState('');

    const router = useRouter();
    
    const loginFunction=async(e: { preventDefault: () => void; })=>{
        e.preventDefault();
    const res = await fetch('/api/authenticate/signup',{
        method:'POST',
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify({
            userName:username,
            userEmail:email,
            userPassword:password
        })    
    })

    const response = await res.json();

    if (response.success) {
      toast.success(response.message);
      if(response.message==="Enter Otp code sent to your email"){
        router.push(`signup/verifyEmail/${email}`)
      }
    } else {
      toast.error(response.message);
    }
  }

  return (
    <div className='w-3/4'>
       <form className='w-full p-3 rounded-lg bg-pink-300 h-max flex flex-col text-black gap-1' onSubmit={loginFunction}>
    <label className='flex justify-center w-full font-bold text-xl text-white'>SIGNUP PAGE</label>
    <label>Username</label>
  <input type='text' placeholder='Enter username' className='rounded h-10 px-2'
  onChange={e=>setUsername(e.target.value)}/>
    <label>Email</label>
  <input type='email' placeholder='Enter email' className='rounded h-10 px-2'
  onChange={e=>setEmail(e.target.value)}/>
  <label>Password</label>
  <input type='password' placeholder='Enter password' className='rounded h-10 px-2'
  onChange={e=>setPassword(e.target.value)}/>
  <button className='bg-gray-400 w-full h-10 text-xl text-white font-bold flex justify-center items-center rounded-md my-3' type='submit'>PROCEED</button>
  <p><span className='text-black font-md'>Have an account? </span><Link href='/login' className='text-blue-500 font-semibold text-md'>Login</Link></p>
</form>

<ToastContainer/>
    </div>
   
)
}

export default SignupContainer