import Image from 'next/image';
import React, { useEffect, useState } from 'react'
import { ToastContainer,toast } from 'react-toastify';
import 'react-toastify/ReactToastify.min.css'

interface Image{
    imageUrl:string,
    _id:string
}

interface Reply{
    _id:string,
    userDp:string,
    userName:string,
    userId:string,
    reply:string,
    date:string
}

interface Comment{
    _id:string,
    userDp:string,
    userName:string,
    userId:string,
    comment:string,
    images:Image[],
    replies:Reply[],
    date:string

}

const CustomerReviewsContainer = ({productId}:any) => {
    const [reviews, setReviews] = useState<Comment[]>([]);
    const [clickedItemId,setClickedItemId] = useState('');
    const [replyMessage,setReplyMessage] = useState('');

    useEffect(() => {
        const fetchComments = async () => {
            const res = await fetch(`/api/review/comment/${productId}`);

            if (res.ok) {
                const response = await res.json();
                if (response.content) {
                    setReviews(response.content.productReviews);
                    console.log(response)
                }
            }


        }
        fetchComments();
    }, [productId])

    const handleRepliesIconClick=(item:any)=>{
        setClickedItemId(item._id);
    }

    const submitReply=async(reviewId:any)=>{
        const res = await fetch('/api/review/reply',{
            method:'POST',
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify({
                productId:productId,
                reviewId:reviewId,
                reply:replyMessage

            })
        });

        if(res.ok){
            const response = await res.json();
            if(response.success){
                setReviews(response.content.comments);
                setReplyMessage('');
            }else{
                toast.error(response.message);
            }
        }else{
            toast.error('Some server error occurred')
        }
        
    }

    return (
        <div className='flex flex-col gap-2 mt-3 bg-white rounded-xl p-2 shadow-xl'>
            {reviews.length!==0 ?(
                <div>
                     <div className='flex justify-between'>
                 <p className='text-md font-semibold text-pink-300'>Customer Reviews<span>({reviews.length})</span></p>
                 <p className='text-sm font-normal text-gray-500'>View All</p>
             </div>
                <div className='flex flex-col gap-2 max-h-screen overflow-auto'>
                {reviews.map((item, index) => (
                    <div key={index} className='h-max w-full bg-gray-100 rounded-md p-2 gap-2'>
                        <div className='flex gap-2'>
                            <Image src={item.userDp} width={30} height={30} alt='' className='rounded-full' />
                            <div>
                                <p className='text-sm font-semibold text-blue-400'>{item.userName}</p>
                                <p className='text-[10px] font-normal text-gray-500'>{item.date}</p>
                            </div>
                        </div>


                        <p className='text-sm font-normal text-black'>{item.comment}</p>
                        <div className='flex overflow-auto gap-2'>
                            {item.images.map((item, index) => (
                                <div key={index} h-20>
                                    <Image src={item.imageUrl} width={100} height={100} alt=''
                                        className='w-full h-full object-contain rounded-xl' />
                                </div>
                            ))}
                        </div>
                        <div className='flex gap-3 justify-end'>
                            <div className='flex gap-1' onClick={()=>handleRepliesIconClick(item)}>
                                <img src='/message_icon.png' alt='' width={20} height={20} />
                                <p className='text-sm font-normal text-gray-500'>{item.replies.length}</p>
                            </div>

                            <div className='flex gap-1'>
                                <img src='/like_icon.png' alt='' width={20} height={20} />
                                <p className='text-sm font-normal text-gray-500'>0</p>
                            </div>
                        </div>

                        {item._id===clickedItemId && (
                            <div className='flex flex-col gap-2 h-max ps-4'>
                                {item.replies.map((item2, index) => (
                                    <div className='w-full h-max bg-white mt-2 rounded-bl-xl rounded-r-xl p-2' key={index}>
                                        <div className='flex gap-2'>
                                            <Image src={item2.userDp} width={30} height={30} alt='' className='rounded-full' />
                                            <div>
                                                <p className='text-sm font-semibold text-blue-400'>{item2.userName}</p>
                                                <p className='text-[10px] font-normal text-gray-500'>{item2.date}</p>
                                            </div>
                                        </div>
                                        <p className='text-sm font-normal text-black'>{item2.reply}</p>
                                    </div>
                                ))}
                                <div className='flex w-full'>
                                    <input value={replyMessage} type='text' placeholder='reply here' className='w-full h-8 px-2 rounded-md bg-white text-sm text-black' 
                                    onChange={(e)=>setReplyMessage(e.target.value)}/>
                                    <img src='/send_icon.png' alt='' width={30} height={20} 
                                    onClick={()=>submitReply(item._id)}/>
                                </div>

                            </div>
                        )}


                    </div>
                ))}
            </div>
                </div>
                
            ):(
                <div className='w-full h-max flex items-center justify-center'>
                    <img src='/message_icon.png' alt='' width={50} height={50}/>
                    <p className='text-xl text-orange-400'>No Customer Reviews</p>
                </div>
            )}
            
            <ToastContainer/>
        </div>

    )
}

export default CustomerReviewsContainer
