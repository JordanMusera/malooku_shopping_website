import Image from 'next/image'
import React, { useEffect, useState } from 'react'

const ReviewedContainer = ({ clickedTab, productId }:any) => {

  const [pendingReviewObj, setPendingReviewObj] = useState<any>([]);

  const handleClickedTab = (tab: string) => {
    clickedTab(tab);
  }

  useEffect(() => {
    const fetchPendingReview = async () => {
      const res = await fetch('/api/orders/purchasedOrders');
      const response = await res.json();
      if(response.content){
        const pendingReviewList = response.content.filter((item:any)=>item.reviewed===true);
        setPendingReviewObj(pendingReviewList);
      }
    }
    fetchPendingReview();
  }, [])

  const navigateToViewReview = (productId1: string) => {
    clickedTab('view_review_tab');
    productId(productId1);
  }

  return (
    <div className="account-reviews">

      <div className='flex flex-col gap-2 overflow-auto'>
      {pendingReviewObj &&
          pendingReviewObj.map((item:any, index:any) => (
            <div
              key={index}
              className="bg-white h-max w-full rounded-md shadow-lg p-5 flex md:flex-row items-center justify-between md:gap-6"
              onClick={() => navigateToViewReview(item.productId)}
            >
              <div className="flex gap-2 justify-between items-center w-full md:w-1/2">
                <Image
                  src={item.product.images[0].imageUrl}
                  alt=""
                  width={80}
                  height={80}
                />
                <div className="flex flex-col gap-2 w-full px-10">
                  <div className="flex justify-end md:justify-start">
                    <p className="px-1 bg-gray-300 rounded-md w-max">
                      {item.status}
                    </p>
                  </div>
                  <p className="text-black font-semibold text-sm w-full">
                    {item.product.title}
                  </p>
                  <p className="text-gray-700 text-sm font-semibold">
                    #{item.productId}
                  </p>
                </div>
              </div>

              
            </div>
          ))}
      </div>

    </div>
  )
}

export default ReviewedContainer
