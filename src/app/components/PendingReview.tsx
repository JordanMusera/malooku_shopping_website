import Image from 'next/image';
import React, { useEffect, useState } from 'react'

const PendingReview = ({ clickedTab,productId }:any) => {
  const [pendingReviewObj,setPendingReviewObj] = useState([]);

  const handleClickedTab = (tab: string) => {
    clickedTab(tab);
  }

  useEffect(() => {
    const fetchPendingReview = async() => {
      const res = await fetch('/api/orders/purchasedOrders');
      const response = await res.json();

      const pendingReviewList = response.content.filter((item:any)=>item.reviewed===false);
      setPendingReviewObj(pendingReviewList);
    }
    fetchPendingReview();
  }, [])

  const navigateToReview=(productId1:string)=>{
    clickedTab('review_tab');
    productId(productId1);
  }

  return (
    <div className='gap-2 flex flex-col w-full h-full p-3 md:p-5 relative'>
      <div className='top-0 w-full h-9 justify-between flex gap-3 xl:gap-10'>
        <button className='w-full text-md text-black font-semibold border border-pink-300 bg-pink-300 rounded-md px-2'
          onClick={() => handleClickedTab('pending_review_tab')}>Pending Review</button>
        <button className='w-full text-md text-black font-semibold border border-pink-300 bg-white rounded-md px-2'
          onClick={() => handleClickedTab('reviewed_tab')}>Reviewed</button>
      </div>
     
     <div className='flex flex-col gap-4 overflow-auto pt-5'>
      {pendingReviewObj && pendingReviewObj.map((item,index)=>(
        <div key={index} className='bg-white h-max w-full rounded-lg shadow-lg p-5 flex flex-col md:flex-row items-center justify-between md:gap-6'>
        <div className='flex gap-2 justify-between items-center w-full md:w-1/2'>
          <Image src={item.product.image} alt='' width={100} height={100} />
          <div className='flex flex-col gap-2 relative'>
            <div className='flex justify-end md:justify-start'>
              <p className='px-1 bg-green-300 rounded-md w-max'>{item.status}</p>
            </div>
            <p className='text-black font-semibold text-sm w-full'>{item.product.title}</p>
          </div>
        </div>

        <div className='flex gap-2 justify-between items-center w-full md:w-1/2'>
          <div className='flex flex-col gap-3 justify-center'>
            <p className='text-green-500 text-xl font-semibold'>${item.product.price}</p>
          </div>
          <div className='flex flex-col w-max gap-4'>
            <p className='text-gray-700 text-sm font-semibold'>Id: {item.productId}</p>
            <button className='border border-pink-300 rounded-lg w-full text-black p-1 bg-pink-200 hover:bg-pink-200'
              onClick={() => navigateToReview(item.productId)}>Review</button>
          </div>
        </div>

      </div>
      ))}
     </div>
    </div>
  )
}

export default PendingReview
