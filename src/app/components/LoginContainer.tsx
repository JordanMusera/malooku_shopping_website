'use client'
import Link from 'next/link';
import React, { useState } from 'react'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/ReactToastify.css'
import { useRouter } from 'next/navigation';

const LoginContainer = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter()

  const validateEmail = (email:string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const loginFunction = async (e: { preventDefault: () => void; }) => {
    e.preventDefault()
    
    if(!validateEmail(email)){
      return toast.info('Please provide a valid email!')
    }

    if(password.length<6){
      return toast.info('password < 6 chars')
    }

    const loadingToast = toast.loading('Validating info');
    const res = await fetch('/api/authenticate/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userEmail: email,
        userPassword: password
      })

    })

    toast.dismiss(loadingToast);
    const response = await res.json();

    if (response.success) {
      toast.success(response.message);
      router.push('/')
    } else {
      toast.error(response.message);
    }

  }

  return (
    <div className='w-3/4'>
      <form className='w-full p-3 rounded-lg bg-pink-300 h-max flex flex-col text-black gap-1' onSubmit={loginFunction}>
        <label className='flex justify-center w-full font-bold text-xl text-white'>LOGIN PAGE</label>
        <label>Email</label>
        <input type='text' placeholder='Enter email' className='rounded h-10 px-2'
          onChange={e => setEmail(e.target.value)} />
        <label>Password</label>
        <input type='password' placeholder='Enter password' className='rounded h-10 px-2'
          onChange={e => setPassword(e.target.value)} />
        <p><span className='text-black font-md'>Forgot password? </span><Link href='/resetPassword' className='text-blue-500 font-semibold text-md'>Reset</Link></p>
        <button className='bg-gray-400 w-full h-10 text-xl text-white font-bold flex justify-center items-center rounded-md my-2'>LOGIN</button>
        <p><span className='text-black font-md'>Don't have an account? </span><Link href='/signup' className='text-blue-500 font-semibold text-md'>Sign up</Link></p>
      </form>

      <ToastContainer />
    </div>

  )
}

export default LoginContainer
