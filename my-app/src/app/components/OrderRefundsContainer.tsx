import React from 'react'

const OrderRefundsContainer = ({clickedTab}) => {
    const handleClickedTab = (tab:string)=>{
        clickedTab(tab)
    }
  return (
    <div className='gap-2 flex flex-col w-full h-full px-5 md:p-0 relative'>
            <div className='top-0 w-full justify-between flex'>
                <button className='text-xl text-black font-semibold bg-white border border-pink-300 rounded-md px-2'
                onClick={()=>handleClickedTab('ordersTab')}>Orders</button>
                <button className='text-xl text-black font-semibold border border-pink-300 bg-white rounded-md px-2'
                onClick={()=>handleClickedTab('cancelled_orders_tab')}>Cancelled Orders</button>
                <button className='text-xl text-black font-semibold border border-pink-300 bg-pink-300 rounded-md px-2'
                onClick={()=>handleClickedTab('refunds_tab')}>Refunds</button>
            </div>
      <p>Order refunds</p>
    </div>
  )
}

export default OrderRefundsContainer
