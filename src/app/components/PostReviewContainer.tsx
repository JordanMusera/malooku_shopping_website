'use client'
import React, { useState } from 'react'
import RatingComponent from './RatingComponent';
import { ToastContainer,toast } from 'react-toastify';
import 'react-toastify/ReactToastify.css'
import { FaArrowLeft } from 'react-icons/fa';

const PostReviewContainer = ({productId,clickedTab}) => {
  const [images,setImages] = useState([]);
  const [imageFiles,setImageFiles] = useState([]);

  const [rating,setRating] = useState(0);
  const [review,setReview] = useState(null);

  const handleImageInput=(e:any)=>{
    e.preventDefault();
    const files:File[] = Array.from(e.target.files || []);

    for(const file of files){
      setImageFiles((prev)=>[...prev,file]);
      const image = URL.createObjectURL(file);
      setImages((prevArray)=>[...prevArray,image]);
    }
    
  }

  const setRatingValue=(value:number)=>{
    setRating(value);
    console.log(value)
  }

  const handleFormSubmit=async(e:any)=>{
    e.preventDefault();

    if(rating==0 || review==null){
      return toast.error('Provide your rating and review!')
    }
    const formData = new FormData();
    formData.append('rating',rating.toString());
    formData.append('review',review);
    formData.append('productId',productId)

    if(imageFiles.length!==0){
      imageFiles.forEach((file)=>{
        formData.append('images',file);
      })
    }

    const res = await fetch('/api/review/comment/user',{
      method:'POST',
      body:formData
    });

    if(res.ok){
      const response = await res.json();
      if(response.success){
        toast.success(response.message);
      }else{
        toast.error(response.message);
      }
    }
    
  }

  return (
    <form className='w-full h-full flex flex-col gap-5 p-5' onSubmit={handleFormSubmit}>
       <FaArrowLeft className='w-9 h-9 p-2 border border-pink-300 flex bg-white rounded-full fixed' onClick={e=>{
          clickedTab('pending_review_tab')
        }}/>
      <div className='w-full h-full justify-center flex flex-col gap-3 bg-white p-10 rounded-lg'>
      <div>
        <p className='text-md text-black font-semibold'>Rate Product</p>
        <RatingComponent setRatingValue={setRatingValue}/>
      </div>

      <div className='flex flex-col gap-3'>
        <p className='text-md text-black font-semibold'>Upload Images - (Optional)</p>
        <div className='h-max flex gap-3 items-center overflow-y-hidden overflow-x-auto'>
          {images.map((item,index)=>(
            <div>
              <img src={item} alt="" width={100} height={100}
          className='rounded-md'/>
            </div>
          ))}
          <div>
            <input type="file"
            id='image_upload'
            multiple
            onChange={handleImageInput}
            placeholder='Add images'
            className='hidden' />
            <label htmlFor="image_upload" className='bg-pink-300 rounded-full
            p-2 w-8 h-20 text-sm text-white'>Add image(s)</label>
          </div>
        </div>
      </div>

      <div className=''>
        <p className='text-md text-black font-semibold'>Add Comment</p>
        <input type='text' placeholder='Enter review here'
        className='text-black text-sm font-medium text-center border border-pink-200
        rounded-md h-max min-h-20 w-full'
        onChange={(e)=>setReview(e.target.value)}/>
      </div>

      <div className='w-full flex justify-end'>
        <button type='submit' className='w-max px-3 py-1 border border-pink-300 bg-pink-200 rounded-xl'>Submit</button>
      </div>
      </div>
      <ToastContainer/>
    </form>
  )
}

export default PostReviewContainer
