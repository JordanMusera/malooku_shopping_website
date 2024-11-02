'use client'
import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/ReactToastify.css'

interface CARDetails {
  product: {
    product: {
      _id: string;
      title: string;
      price: number;
      description: string;
      category: string;
      image: string;
    };
    status: string;
    quantity: number;
    productQtyPrice: number;
  };
  orderId: string;
}

const RefundFormContainer = ({ orderDetails }: { orderDetails: CARDetails }) => {
  const [image, setImage] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [selectedReason, setSelectedReason] = useState('');
  const [providedReason, setProvidedReason] = useState('');
  const [imageArray, setImageArray] = useState<string[]>([]);
  const [imageFileArray, setImageFileArray] = useState<File[]>([]);

  const submitRefundForm = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    const formData = new FormData();

    if (imageFileArray.length !== 0) {
      imageFileArray.forEach((file) => {
        formData.append('images', file);
      });
    }

    formData.append('selectedReason', selectedReason);
    formData.append('providedReason', providedReason);
    formData.append('orderId', orderDetails.orderId);
    formData.append('productId', orderDetails.product.product._id);

    const res = await fetch('api/orders/refundedOrder/refundApplication', {
      method: 'POST',
      body: formData,
    });

    const response = await res.json();
    if (response.success) {
      toast.success(response.message);
    } else {
      toast.error(response.message);
    }
  };

  const handleImageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const files: File[] = Array.from(e.target.files || []);
    for (const file of files) {
      setImageFile(file);
      setImageFileArray((prev) => [...prev, file]);
      const newImage = URL.createObjectURL(file);
      setImage(newImage);
      setImageArray((prevArray) => [...prevArray, newImage]);
    }
  };

  return (
    <div className='w-full h-full overflow-auto p-2 flex items-center'>
      <form className='w-full flex flex-col gap-2' onSubmit={submitRefundForm}>
      <p className='text-md text-pink-300 font-semibold'>*Apply for Refund</p>
      <p className='text-sm text-red-500 font-semibold bg-red-200 rounded-lg p-1'>*Please provide reasons why you want to refund this product.</p>
        <div className='flex items-center gap-4'>
          <div className='flex gap-3 items-center rounded-lg shadow-2xl w-max p-5'>
            <img src={orderDetails.product.product.image} alt="" width={100} height={100} />
            <div>
              <p className='text-sm font-semibold'>{orderDetails.product.product.title}</p>
              <div className='flex gap-4 text-lg'>
                <p>{orderDetails.product.quantity}</p>
                <p>*</p>
                <p>{orderDetails.product.product.price}</p>
              </div>
              <p className='text-2xl text-pink-300 font-bold'>${orderDetails.product.productQtyPrice}</p>
            </div>
          </div>
          <p className='bg-orange-300 rounded-lg p-1 text-white text-sm font-semibold'>{orderDetails.product.status}</p>
        </div>

        <div className='flex flex-col w-2/3 gap-2'>
          <label htmlFor='delivery-options' className='font-semibold'>Select Reason</label>
          <select
            id='reason-options'
            required
            className='text-md font-semibold ms-5 rounded-md p-1'
            onChange={(e) => setSelectedReason(e.target.value)}
          >
            <option value='option1'>option 1</option>
            <option value='option2'>option 2</option>
            <option value='option3'>option 3</option>
            <option value='option4'>option 4</option>
          </select>
        </div>

        <label className='font-semibold'>Attach Images (Optional)</label>
        <div className='flex gap-3 h-max items-center overflow-x-auto overflow-y-hidden'>
          {imageArray.map((image, index) => (
            <div key={index}>
              <div className='w-40 h-40 rounded-md bg-white'>
                <img src={image} alt='' sizes='full' className='rounded-md contain-content w-full h-full' />
              </div>
            </div>
          ))}
          <div>
            <input
              type='file'
              id='file_upload'
              multiple
              required
              placeholder='+Add image'
              title='Add image'
              className='rounded-2xl p-1 hidden'
              onChange={handleImageInput}
            />
            <label htmlFor="file_upload" className='bg-pink-200 border border-pink-300 hover:bg-pink-300 text-sm font-bold text-white rounded-full w-max h-8 flex items-center justify-center p-1'>Add Image</label>
          </div>

        </div>

        <label htmlFor='' className='font-semibold'>Provide Reason</label>
        <input
          type='text'
          maxLength={500}
          placeholder='Provide reason for refund'
          className='h-40 w-full justify-center items-center text-center rounded-lg'
          onChange={(e) => setProvidedReason(e.target.value)}
        />

        <div className='w-full flex items-center justify-end text-black font-semibold'>
          <button
            type='submit'
            className='bg-pink-200 border border-pink-300 hover:bg-pink-300 p-2 rounded-lg w-max'
          >
            Submit Application
          </button>
        </div>
        <ToastContainer />
      </form>
    </div>

  );
};

export default RefundFormContainer;
