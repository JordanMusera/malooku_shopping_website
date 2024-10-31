'use client'
import { setCart } from '@/store/cartSlice';
import { RootState } from '@/store/store';
import { setShippingAddress, addShippingAddress, setPayments, deleteShippingAddress, removePaymentMethod, addPaymentMethod } from '@/store/userSlice';
import { setShippingAddress2, setPaymentInfo, setDeliveryInfo } from '@/store/orderSlice';
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
interface Cart {
  cartData: CartItem[],
  totalCartCost: number
};

interface CartItem {
  rating: {
    rate: number,
    count: number
  },
  _id: string,
  id: number,
  title: string,
  price: number,
  description: string,
  category: string,
  image: string,
  orderedQty: number,
  productQtyPrice: number
}


const OrderDetailsContainer = () => {
  const [addPaymentContainerVisibility, setAddPaymentContainerVisibility] = useState(false);
  const [addAddressContainerVisibility, setAddAddressContainerVisibility] = useState(false);

  const [county, setCounty] = useState('');
  const [city, setCity] = useState('');
  const [street, setStreet] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [selectedAddressIndex, setSelectedAddressIndex] = useState<number | null>(null);
  const [selectedPaymentIndex, setSelectedPaymentIndex] = useState<number | null>(null);

  const [accType, setAccType] = useState('mpesa');
  const [accName, setAccName] = useState('');
  const [accNumber, setAccNumber] = useState(0);

  const dispatch = useDispatch();

  const addPaymentContainerVisibilityFunction = (visibility: boolean) => {
    if (addAddressContainerVisibility && visibility == true) {
      setAddAddressContainerVisibility(false);
      setAddPaymentContainerVisibility(true)
    } else {
      setAddPaymentContainerVisibility(visibility)
    }
  }

  const addAddressContainerVisibilityFunction = (visibility: boolean) => {
    if (addPaymentContainerVisibility && visibility == true) {
      setAddPaymentContainerVisibility(false);
      setAddAddressContainerVisibility(true);
    } else {
      setAddAddressContainerVisibility(visibility)
    }
  }

  const addShippingAddress1 = async () => {
    console.log("reached")
    setAddAddressContainerVisibility(false);
    const address = {
      county: county,
      city: city,
      street: street,
      postalCode: postalCode,
      _id: ''
    }
    dispatch(addShippingAddress(address))

    const res = await fetch('/api/users/update/shippingAddress', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        newShippingAddress: address
      })
    });
    const response = await res.json();
    if (response.success) {
      toast.success('Address added');
      dispatch(setShippingAddress(response.content.shippingAddress))
    } else {
      toast.error(response.message);
    }

  }

  const deleteShippingAddress1 = async (index: number) => {
    dispatch(deleteShippingAddress(index))

    const res = await fetch('/api/users/update/shippingAddress', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        shippingAddressId: shippingAddress[index]._id
      })
    });
    const response = await res.json();
    if (response.success) {
      toast.success('Address deleted');
      dispatch(setShippingAddress(response.content.shippingAddress))
    } else {
      toast.error(response.message);
    }
  }

  const removePaymentMethod1 = async (index: number) => {
    dispatch(removePaymentMethod(index))

    const res = await fetch('/api/users/update/payment', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        paymentMethodId: paymentMethods[index]._id
      })
    });
    const response = await res.json();
    if (response.success) {
      toast.success('Payment method deleted');
      dispatch(setPayments(response.content.paymentMethods))
    } else {
      toast.error(response.message);
    }
  }

  const addPaymentMethod1 = async () => {
    setAddPaymentContainerVisibility(false);
    const paymentDetails = {
      accName: accName,
      accNumber: accNumber,
      accType: accType,
      _id: ''
    }
    dispatch(addPaymentMethod(paymentDetails));

    const res = await fetch('/api/users/update/payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        paymentDetails: paymentDetails
      })
    });
    const response = await res.json();
    if (response.success) {
      toast.success('Address added');
      dispatch(setPayments(response.content.paymentMethods))
    } else {
      toast.error(response.message);
    }
  }

  useEffect(() => {
    const fetchUserData = async () => {
      const res = await fetch('/api/users');
      const response = await res.json();
      dispatch(setShippingAddress(response.user.shippingAddress));
      dispatch(setPayments(response.user.paymentMethods));
    }

    const fetchCartData = async () => {
      const res = await fetch('/api/cart/user');
      const response = await res.json();
      dispatch(setCart(response));
    }
    fetchUserData();
    fetchCartData();
  }, [])

  const handleSelectAddress = (index: number) => {
    setSelectedAddressIndex(index);
    setOrderShippingAddress(index);
  };

  const handleSelectPayment = (index: number) => {
    setSelectedPaymentIndex(index);
    setOrderPaymentMethod(index);
  };

  const setOrderShippingAddress = (index: number) => {
    dispatch(setShippingAddress2(shippingAddress[index]))
  }

  const setOrderPaymentMethod = (index: number) => {
    dispatch(setPaymentInfo(paymentMethods[index]))
  }

  const setOrderDeliveryInfo = () => {

  }

  const { shippingAddress, paymentMethods } = useSelector(
    (state: RootState) => state.user
  );


  return (
    <div className='xl:pr-5 flex flex-col gap-4'>

      <div className='w-full rounded-2xl bg-white h-max shadow-xl p-5 flex flex-col gap-2'>
        <label className='text-black font-bold text-md'>Shipping Address</label>
        <p className='text-pink-300 font-bold text-sm flex justify-start cursor-pointer'
          onClick={() => addAddressContainerVisibilityFunction(true)}>+  Add Shipping Address</p>

        <div className='gap-2 items-start flex w-full overflow-x-auto'>
          {shippingAddress.map((item, index) => (
            <div
              key={index}
              className='flex-shrink-0'
              onClick={() => handleSelectAddress(index)}
            >
              <div className={`w-52 h-32 border-[2px] rounded-xl shadow-2xl flex flex-col cursor-pointer hover:bg-pink-200
            ${selectedAddressIndex === index
                  ? 'border-pink-300 bg-pink-100'
                  : 'border-gray-300 bg-gray-100'
                }`
              }>
                <div className='flex justify-between p-3'>
                  <label className='text-black font-medium text-sm'>Address</label>
                  <button onClick={() => deleteShippingAddress1(index)}><img src="/delete_icon.png" alt="" width={20} height={20} /></button>
                </div>
                <p className='w-full px-2 break-words'>
                  {`${item.postalCode}, ${item.street}, ${item.city}, ${item.county}`}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className='w-full rounded-2xl bg-white h-max shadow-xl p-5 flex flex-col gap-2'>
          <label className='text-black font-bold text-md'>Shipping Method</label>

          <div className='flex flex-col gap-4 ms-5'>
            <label htmlFor="pickup"
              className='text-md font-semibold'><input type='radio' id='pickup' name='delivery_method' />
              Pick-up station
            </label>

            <label htmlFor='delivery-options' className='ms-2'>Pick-up Options</label>
            <select id='delivery-options' className='text-md font-semibold ms-5'>
              <option value="option 1">option 1</option>
              <option value="option 1">option 1</option>
              <option value="option 1">option 1</option>
              <option value="option 1">option 1</option>
            </select>

            <label htmlFor="pickup"
              className='text-md font-semibold'><input type='radio' id='pickup' name='delivery_method' />
              Home delivery
            </label>
          </div>
        </div>

        <div className='w-full rounded-2xl bg-white h-max shadow-xl p-5 flex flex-col gap-2'>
          <label className='text-black font-bold text-md'>Payment Method</label>
          <p className='text-pink-300 font-bold text-sm flex justify-start cursor-pointer'
            onClick={() => addPaymentContainerVisibilityFunction(true)}>+  Add payment method</p>

          <div className='gap-2 items-start flex w-full overflow-x-auto'>
            {paymentMethods.map((item, index) => (
              <div
                key={index}
                className='flex-shrink-0'
                onClick={() => handleSelectPayment(index)}
              >
                <div className={`w-52 h-32 border-[2px] rounded-xl shadow-2xl flex flex-col cursor-pointer hover:bg-pink-200
        ${selectedPaymentIndex === index
                    ? 'border-pink-300 bg-pink-100'
                    : 'border-gray-300 bg-gray-100'
                  }`
                }>
                  <div className='flex justify-between p-3'>
                    <label className='text-black font-medium text-sm'>Payment</label>
                    <button onClick={() => removePaymentMethod1(index)}><img src="/delete_icon.png" alt="" width={20} height={20} /></button>
                  </div>
                  <div className='flex flex-col items-center justify-center'>
                    {item.accType === "mpesa" && (
                      <img src="/mpesa_logo.svg" alt="" width={60} height={60} className='justify-center' />
                    )}
                    {item.accType === "bank" && (
                      <img src="/visa_icon.svg" alt="" width={40} height={40} className='justify-center' />
                    )}
                    <p className='text-sm font-bold text-gray-600'>{item.accNumber}</p>
                  </div>
                </div>
              </div>
            ))}

          </div>


          <div className='gap-4 mt-2 hidden'>
            <button className='font-bold text-gray-500 text-xl border mb-5 border-red-600 bg-white w-full p-2 rounded-xl'>Cancel Purchase</button>
            <button className='font-bold text-black text-xl border mb-5 border-pink-300 bg-pink-200 w-full p-2 rounded-xl'>Complete Purchase</button>
          </div>
        </div>




        {/*Adding address Container */}
        {addAddressContainerVisibility && (
          <div className='absolute self-center w-3/4 md:w-1/3 h-max bg-gray-100 shadow-2xl p-5 flex-col rounded-xl gap-2 flex'>
            <label htmlFor="countyInput" className='text-black text-sm font-semibold'>County</label>
            <input onChange={e => setCounty(e.target.value)} type="text" id='countyInput' placeholder='County' className='w-full rounded-md h-8 bg-white border border-pink-300 px-5 text-black' />

            <label htmlFor="cityInput" className='text-black text-sm font-semibold'>City</label>
            <input onChange={e => setCity(e.target.value)} type="text" id='cityInput' placeholder='City' className='w-full rounded-md h-8 bg-white border border-pink-300 px-5 text-black' />

            <label htmlFor="streetInput" className='text-black text-sm font-semibold'>Street</label>
            <input onChange={e => setStreet(e.target.value)} type="text" id='streetInput' placeholder='Street' className='w-full rounded-md h-8 bg-white border border-pink-300 px-5 text-black' />

            <label htmlFor="postalInput" className='text-black text-sm font-semibold'>Postal Code</label>
            <input onChange={e => setPostalCode(e.target.value)} type="text" id='postalInput' placeholder='postal Code' className='w-full rounded-md h-8 bg-white border border-pink-300 px-5 text-black' />
            <div className='flex gap-3'>
              <button className='font-bold text-black text-md border border-red-400 bg-red-300 w-full p-1 rounded-md hover:bg-red-400'
                onClick={() => addAddressContainerVisibilityFunction(false)}>Close</button>
              <button type='submit' className='font-bold text-black text-md border border-pink-300 bg-pink-200 w-full p-1 rounded-md hover:bg-pink-300'
                onClick={() => addShippingAddress1()}>Add</button>
            </div>

          </div>
        )}


        {addPaymentContainerVisibility && (
          <div className='absolute self-center w-3/4 md:w-1/3 h-max bg-gray-100 shadow-2xl p-5 flex-col rounded-xl gap-2 flex'>
            <label htmlFor="payment_type" className='text-black text-sm font-semibold'>Payment Type</label>
            <select value={accType} onChange={e => setAccType(e.target.value)} id='payment_type' className='h-8 rounded-md w-full'>
              <option value="mpesa">M-pesa</option>
              <option value="visa">Bank(visa)</option>
            </select>

            <label htmlFor="accountNameInput" className='text-black text-sm font-semibold'>Account Name</label>
            <input onChange={e => setAccName(e.target.value)} type="text" id='accountNameInput' placeholder='Account Name' className='w-full rounded-md h-8 bg-white border border-pink-300 px-5 text-black' />

            <label htmlFor="accountNumberInput" className='text-black text-sm font-semibold'>Account Number</label>
            <input onChange={e => setAccNumber(Number(e.target.value))} type="number" id='accountNumberInput' placeholder='Account Number' className='w-full rounded-md h-8 bg-white border border-pink-300 px-5 text-black' />

            <div className='flex gap-3'>
              <button className='font-bold text-black text-md border border-red-400 bg-red-300 w-full p-1 rounded-md hover:bg-red-400'
                onClick={() => addPaymentContainerVisibilityFunction(false)}>Close</button>
              <button type='submit' className='font-bold text-black text-md border border-pink-300 bg-pink-200 w-full p-1 rounded-md hover:bg-pink-300'
                onClick={() => addPaymentMethod1()}>Add</button>
            </div>
          </div>
        )}

<ToastContainer />

      </div>
    </div>
  )

}


export default OrderDetailsContainer
