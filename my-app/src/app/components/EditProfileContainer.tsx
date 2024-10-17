'use client'
import Link from 'next/link';
import React, { useEffect, useState } from 'react'
import { ToastContainer,toast } from 'react-toastify';
import 'react-toastify/ReactToastify.css'

const AccountProfileContainer = () => {
  const[fullName,setFullName] = useState("");
  const[email,setEmail] = useState("");
  const[phone,setPhone] = useState("");
  const[county,setCounty] = useState("");
  const[city,setCity] = useState("");
  const[street,setStreet] = useState("");

  useEffect(()=>{
    const fetchDetails=async()=>{
      const res = await fetch('/api/users');
      const response = await res.json();

      if(response.success){
       const user = response.user;

       setFullName(user.name);
       setEmail(user.email);
       setPhone(user.phone);
       setCounty(user.address.county);
       setCity(user.address.city);
       setStreet(user.address.street);
      }
    }
    fetchDetails();
  },[])

  const updateDetails=async(e: { preventDefault: () => void; })=>{
    e.preventDefault();
    const res = await fetch('api/users',{
      method:'POST',
      headers:{
        'Content-Type':'application/json'
      },
      body:JSON.stringify({
        county,
        city,
        street,
        fullName,
        email,
        phone
      })
    });

    const response = await res.json();
    if(response.success){
      toast.success("Information Updated!");
      console.log('Update Success!!');
    }else{
      toast.error(response.message);
    }
  }


  return (
    <form className='w-full h-max flex flex-col items-center p-5' onSubmit={updateDetails}>
      <div className='w-32 h-32'>
        <img src='user_icon.png' alt='' sizes='full' className='rounded-full bg-gray-200 p-2 border border-pink-300' />
      </div>

      <div className='w-3/4 flex flex-col gap-2'>
        <div className='w-full'>
          <label>Full Name</label>
          <input type='text' value={fullName} placeholder='Full Name' className='w-full h-10 px-3 rounded-md bg-white' onChange={e=>setFullName(e.target.value)}/>
        </div>

        <div className='w-full'>
          <label>Email</label>
          <input type='email' value={email} placeholder='Email' className='w-full h-10 px-3 rounded-md bg-white' onChange={e=>setEmail(e.target.value)}/>
        </div>

        <div className='w-full'>
          <label>Phone Number</label>
          <input type='number' value={phone} placeholder='Phone Number' className='w-full h-10 px-3 rounded-md bg-white' onChange={e=>setPhone(e.target.value)}/>
        </div>

        <div className='grid grid-cols-2 gap-4'>
        <div className='w-full col-span-1'>
          <label>City</label>
          <input type='text' value={city} placeholder='City' className='w-full h-10 px-3 rounded-md bg-white' onChange={e=>setCity(e.target.value)}/>
        </div>
        <div className='w-full col-span-1'>
          <label>Street</label>
          <input type='text' value={street} placeholder='Street' className='w-full h-10 px-3 rounded-md bg-white' onChange={e=>setStreet(e.target.value)}/>
        </div>
        </div>

        <div className='w-full'>
          <label>County</label>
          <input type='text' value={county} placeholder='County' className='w-full h-10 px-3 rounded-md bg-white' onChange={e=>setCounty(e.target.value)}/>
        </div>

        <div className='flex gap-5 justify-end mb-5'>
          <Link href='/' className='w-max p-2 border border-pink-300 rounded-md bg-white'>Back To Home</Link>
          <button className='w-max p-2 border border-pink-300 rounded-md bg-pink-200 hover:bg-pink-300' type='submit'>Save Changes</button>
        </div>

      </div>

<ToastContainer/>
    </form>
  )
}

export default AccountProfileContainer
