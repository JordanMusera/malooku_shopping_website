import React from 'react'
import OrderDetailsContainer from '../components/OrderDetailsContainer'
import CheckoutCartContainer from '../components/CheckoutCartContainer'
import Topbar from '../components/Topbar'


const page = () => {
  return (
    <div className='flex flex-col xl:flex-row relative'>
      <div className='fixed top-0 w-full shadow-xl z-10'>
        <Topbar />
      </div>

      <div className='xl:grid xl:grid-cols-5 xl:h-screen h-max bg-gray-100 xl:w-full w-screen xl:px-20 p-2 justify-center pt-16'>
        <div className='xl:col-span-4 overflow-auto'>
          <OrderDetailsContainer />
        </div>


      </div>
      <div className='xl:fixed xl:top-16 xl:right-4 xl:bottom-4 xl:w-1/5 xl:z-10 items-center justify-center xl:px-0 px-2 bg-gray-100 mb-3'>
        <div className='rounded-2xl shadow-xl bg-white w-full xl:h-full overflow-auto overflow-x-hidden'>
          <CheckoutCartContainer />
        </div>
      </div>


    </div>
  )
}

export default page
