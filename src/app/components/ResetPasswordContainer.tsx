'use client'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/ReactToastify.css'

const ResetPasswordContainer = () => {
    const [viewone, setViewOne] = useState(true);
    const [viewtwo, setViewTwo] = useState(false);

    const [email, setEmail] = useState("");
    const [otpCode, setOtpCode] = useState('');
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');

    const router = useRouter();

    const requestOtp = async (e: { preventDefault: () => void }) => {
        e.preventDefault();
        const res = await fetch('api/authenticate/resetPassword/request_otp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email
            })
        })

        const response = await res.json();
        if (response.success) {
            setViewOne(false);
            setViewTwo(true);
            toast.success(response.message);
        } else {
            toast.error(response.message);
        }
    }

    const changePassword = async (e: { preventDefault: () => void }) => {
        e.preventDefault();
        if(password!==password2){
            return toast.error('Passwords do not match')
        }
        const res = await fetch('api/authenticate/resetPassword/change_password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: password,
                otpCode: otpCode
            })
        })

        const response = await res.json();
        if (response.success) {
            toast.success(response.message);
            if (response.message === "Password updated") {
                router.push('/login');
            }
        } else {
            toast.error(response.message);
        }
    }

    return (
        <div className='w-full'>
            {viewone && (
                <div className='w-full h-full flex flex-col justify-center items-center'>
                    <form className='w-2/3 flex flex-col gap-3' onSubmit={requestOtp}>
                        <input className="w-full h-10 text-center rounded-md border border-pink-300" placeholder='Enter email' type='email'
                            onChange={e => setEmail(e.target.value)} />
                        <button className='w-full h-10 rounded-md bg-pink-300' type='submit'>SUBMIT</button>
                    </form>
                </div>
            )}

            {viewtwo && (
                <div className='w-full h-full flex flex-col justify-center items-center'>
                    <form className='w-2/3 flex flex-col gap-3' onSubmit={changePassword}>
                        <p className='w-full h-max text-black font-semibold text-sm'>Enter OTP code sent to this email <span className='text-blue-500'>{email}</span> <span className='text-red-500'><u>change email</u></span> <span className='text-orange-500 ms-10'><u>resend code</u></span></p>
                        <input className="w-full h-10 text-center rounded-md border border-pink-300" placeholder='Enter otp' type='number' onChange={e => setOtpCode(e.target.value)} />
                        <input className="w-full h-10 text-center rounded-md border border-pink-300" placeholder='Enter new password' type='password' onChange={e => setPassword(e.target.value)} />
                        <input className="w-full h-10 text-center rounded-md border border-pink-300" placeholder='Re-enter password' type='password' onChange={e => setPassword2(e.target.value)} />
                        <button className='w-full h-10 rounded-md bg-pink-300' type='submit'>SUBMIT</button>
                    </form>
                </div>
            )}



            <ToastContainer />
        </div>
    )
}

export default ResetPasswordContainer
