'use client'
import React, { useState } from 'react'
import { ToastContainer,toast } from 'react-toastify';
import 'react-toastify/ReactToastify.css'

interface EmailProps{
    email:string
}

const verifyEmailContainer: React.FC<EmailProps> = ({email}) => {
    const[otpCode,setOtpCode] = useState('');

    const decodedEmail = email ? decodeURIComponent(email) : '';

    const submitOtp=async(e: { preventDefault: () => void; })=>{
        e.preventDefault();
        const res = await fetch('/api/authenticate/signup/verifyEmail',{
            method:'POST',
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify({
                userEmail:decodedEmail,
                otpCode:otpCode
            })
        })

        const response = await res.json();
        if(response.success){
            toast.success(response.message);
        }else{
            toast.error(response.message);
        }

    }

  return (
    <div className='w-full h-full'>
        <div className='w-full h-full flex flex-col justify-center items-center' onSubmit={submitOtp}>
        <p className='w-1/2 h-max text-black font-semibold text-sm'>Enter OTP code sent to this email <span className='text-blue-500'>{decodedEmail}</span></p>
      <form className='w-1/2 flex flex-col gap-3'>
      <input onChange={(e)=>setOtpCode(e.target.value)} className="w-full h-10 text-center rounded-md border border-pink-300" placeholder='Enter otp code' type='number' maxLength={5}/>
      <button className='w-full h-10 rounded-md bg-pink-300' type='submit'>SUBMIT</button>
      </form>
    </div>

    <ToastContainer/>
    </div>
    
  )
}

export default verifyEmailContainer
