import Link from 'next/link'
import React from 'react'

const Footer = () => {
  return (
    <div className='flex flex-col md:flex-row xl:flex mt-5 px-5 bg-gray-100'>
      {/*left*/}
      <div className='w-full md:w-1/2 xl:w-1/4 flex flex-col gap-5  p-3'>
        <h1 className='font-semibold'>MALOOKU</h1>
        <p>Hamisi 251 TIRIKI 30509 Vihiga Kenya</p>
        <span className='font-semibold'>jordanmusera@gmail.com</span>
        <span className='font-semibold'>+254113197613</span>
      </div>
      {/*center*/}
      <div className='hidden w-1/2 xl:flex p-3 bg-gray-100'>
        {/*first*/}
        <div className='flex flex-col gap-2 flex-1'>
          <h1 className='font-semibold'>Company</h1>
          <Link href='/'>About us</Link>
          <Link href='/'>Careers</Link>
          <Link href='/'>Affiliates</Link>
          <Link href='/'>Blog</Link>
          <Link href='/'>Contact us</Link>
        </div>
         {/*second*/}
         <div className='flex flex-col gap-2 flex-1'>
          <h1 className='font-semibold'>Shop</h1>
          <Link href='/'>New arrivals</Link>
          <Link href='/'>Accessories</Link>
          <Link href='/'>Men</Link>
          <Link href='/'>Women</Link>
          <Link href='/'>All products</Link>
        </div>
          {/*third*/}
          <div className='flex flex-col gap-2 flex-1'>
          <h1 className='font-semibold'>Help</h1>
          <Link href='/'>Customer service</Link>
          <Link href='/'>My account</Link>
          <Link href='/'>Find a store</Link>
          <Link href='/'>Legal and privacy</Link>
          <Link href='/'>Gift card</Link>
        </div>

      </div>
      {/*right*/}
      <div className='w-full md:w-1/2 xl:w-1/4 flex flex-col gap-5 bg-gray-100 p-3'>
        <h1 className='font-semibold'>SUBSCRIBE</h1>
        <p>Be the first to get the latest news, promotion and much more</p>
        <div className='w-max flex border border-black rounded-md px-1 py-1 h-10'>
          <input type='email' placeholder='enter email' className='h-full bg-gray-100 flex-1 border-0'/>
          <button className='font-semibold rounded-md bg-black text-white px-1'>Submit</button>
        </div>
      </div>
    </div>
  )
}

export default Footer