import React, { useEffect, useState } from 'react';
import RatingComponent from './RatingComponent';
import Image from 'next/image';
import { FaStar,FaArrowLeft } from 'react-icons/fa';
import { ToastContainer,toast } from 'react-toastify';
import 'react-toastify/ReactToastify.css'

const ViewReviewContainer = ({productId,clickedTab}:any) => {
    const [fetchedReviews, setFetchedReviews] = useState([]);

    useEffect(() => {
        const fetchReview = async () => {
            const res = await fetch(`/api/review/comment/user/${productId}`);
            if (res.ok) {
                const response = await res.json();
                setFetchedReviews(response.content);
            }
        };
        fetchReview();
    }, []);

    const deleteReview=async(reviewId:string)=>{
        const res = await fetch(`/api/review/comment/user/${productId}/${reviewId}`,{
            method:'DELETE'
        })
        
        if(res.ok){
            const response = await res.json();
            console.log(response);
            setFetchedReviews(response.content);

            if(response.success){
                toast.success(response.message)
            }else{
                toast.error(response.message);
            }
           
        }
    }

    return (
        <div className='w-full h-full overflow-auto p-5'>
            <FaArrowLeft className='w-9 h-9 p-2 border border-pink-300 flex bg-white rounded-full fixed' onClick={e=>{
          clickedTab('reviewed_tab')
        }}/>
            <div className='flex flex-col-reverse gap-3 pt-10'>
                {fetchedReviews.map((item:any, index) => (
                    <div key={index} className='w-full h-max bg-white rounded-lg flex  justify-between p-2'>
                        <div className='w-1/3 p-2 flex gap-2 items-center justify-center'>
                            {item.images.length!=0 ? (
                                <div className='flex gap-2'>
                                    {item.images.map((image:any, imgIndex:any) => (
                                        <div key={imgIndex} className='flex h-20'>
                                            <Image src={image.imageUrl} alt='Review Image' width={80} height={80} className='object-contain' />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div>
                                   <p className='text-md text-black font-semibold'>No images</p>
                                </div>
                            )}


                        </div>
                        <div className='w-1/3 p-2'>
                            <div className='flex justify-end'>
                                {
                                    [...Array(5)].map((item2, index) => {
                                        return <FaStar key={index}
                                            color={index < item.rating ? "#ffc107" : "#e4e5e9"} />
                                    })
                                }
                            </div>
                            <div className='flex flex-col items-center justify-center'>
                                <p className='w-full text-black text-sm font-semibold'>Review</p>
                                <p className='w-full text-black'>{item.comment}</p>
                            </div>
                        </div>
                        <div className='w-1/3 p-2 flex items-center justify-center'>
                            <button className='bg-orange-400 border border-red-500 rounded-lg p-1 text-white font-semibold text-sm'
                            onClick={()=>deleteReview(item._id)}>Delete Review</button>
                        </div>
                    </div>
                ))}
            </div>
            <ToastContainer/>
        </div>
    );
};

export default ViewReviewContainer;
