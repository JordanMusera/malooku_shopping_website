import React from 'react'
import OrderDetailsContainer from '../components/OrderDetailsContainer'
import CheckoutCartContainer from '../components/CheckoutCartContainer'
import Topbar from '../components/Topbar'


const page = () => {
  return (
    <div className='relative'>
        <div className='fixed top-0 w-full shadow-xl'>
             <Topbar/>
        </div>
       
        <div className='grid grid-cols-5 h-screen bg-gray-100 py-5 px-20 justify-center pt-16'>
            <div className='col-span-4 overflow-auto'>
            <OrderDetailsContainer/>
        </div>

       
        </div>
        <div className='fixed top-16 right-4 bottom-4 w-1/5 z-10 items-center justify-center'>
             <div className='rounded-2xl shadow-xl bg-white w-full h-full'>
            <CheckoutCartContainer/>
        </div>
        </div>
       
      
    </div>
  )
}

export default page
