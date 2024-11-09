import React, { useEffect, useState } from 'react'
import RatingComponent from './RatingComponent'

const ViewReviewContainer = () => {
    const [fetchedReviews,setFetchedReviews] = useState([]);
    useEffect(()=>{
        const fetchReview=async()=>{
            const res = await fetch('/api/review/comment/user/670050f1b9ca8de293f9a360');
            if(res.ok){
                 const response = await res.json();
                 setFetchedReviews(response.content);
            }
           ;
        }
        fetchReview();
    },[]);
  return (
    <div className='w-full h-full overflow-auto p-5'>
        <div className='flex flex-col gap-3'>
            {fetchedReviews.map((item,index)=>(
                <div className='w-full h-20 bg-white rounded-lg'>
                    
                </div>
            ))}
        </div>
    </div>
  )
}

export default ViewReviewContainer
