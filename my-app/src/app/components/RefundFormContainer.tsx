import React, { useState } from 'react';

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
  };

  const handleImageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImageFileArray((prev) => [...prev, file]);
      const newImage = URL.createObjectURL(file);
      setImage(newImage);
      setImageArray((prevArray) => [...prevArray, newImage]);
    }
  };

  return (
    <form className='w-full h-full flex flex-col gap-2' onSubmit={submitRefundForm}>
      <div className='flex flex-col w-2/3 gap-2'>
        <label htmlFor='delivery-options'>Select Reason</label>
        <select
          id='reason-options'
          className='text-md font-semibold ms-5 rounded-md p-1'
          onChange={(e) => setSelectedReason(e.target.value)}
        >
          <option value='option 1'>option 1</option>
          <option value='option 1'>option 1</option>
          <option value='option 1'>option 1</option>
          <option value='option 1'>option 1</option>
        </select>
      </div>

      <label>Attach Images (Optional)</label>
      <div className='flex gap-3 items-center'>
        {imageArray.map((image, index) => (
          <div key={index}>
            <div className='w-40 h-40 rounded-md bg-white'>
              <img src={image} alt='' width={100} height={100} className='rounded-md' />
            </div>
          </div>
        ))}
        <input
          type='file'
          placeholder='+Add image'
          title='Add image'
          className='rounded-2xl p-1'
          onChange={handleImageInput}
        />
      </div>

      <label htmlFor=''>Provide Reason</label>
      <input
        type='text'
        placeholder='Provide reason for refund'
        className='h-1/3 w-full justify-center items-center text-center rounded-lg'
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
    </form>
  );
};

export default RefundFormContainer;
