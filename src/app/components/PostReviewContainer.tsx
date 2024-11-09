'use client'
import React, { useState } from 'react'

const PostReviewContainer = () => {
  const [images,setImages] = useState([]);
  const [imageFiles,setImageFiles] = useState([]);

  const [rating,setRating] = useState('');
  const [review,setReview] = useState('');

  const handleImageInput=(e:any)=>{
    e.preventDefault();
    const files:File[] = Array.from(e.target.files || []);

    for(const file of files){
      setImageFiles((prev)=>[...prev,file]);
      const image = URL.createObjectURL(file);
      setImages((prevArray)=>[...prevArray,image]);
    }
    
  }

  const handleFormSubmit=async(e:any)=>{
    e.preventDefault();
    const formData = new FormData();
    formData.append('rating',rating);
    formData.append('review',review);
    formData.append('productId','670050f1b9ca8de293f9a360')

    if(imageFiles.length!==0){
      imageFiles.forEach((file)=>{
        formData.append('images',file);
      })
    }

    const res = await fetch('/api/review/comment/user',{
      method:'POST',
      body:formData
    });

    const response = await res.json();
  }

  return (
    <form className='w-full h-full flex justify-center items-center' onSubmit={handleFormSubmit}>
      <div className='w-full xl:w-max h-max flex flex-col gap-3 bg-white xl:p-10 xl:rounded-lg'>
      <div>
        <p className='text-md text-black font-semibold'>Rate Product</p>
        <input type="text" placeholder='enter rating' onChange={(e)=>setRating(e.target.value)} />
      </div>

      <div className='flex flex-col gap-3'>
        <p className='text-md text-black font-semibold'>Upload Images - (Optional)</p>
        <div className='flex gap-3 items-center overflow-auto'>
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
            p-2 w-8 h-8 text-sm text-white'>Add image(s)</label>
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
      
    </form>
  )
}

export default PostReviewContainer
