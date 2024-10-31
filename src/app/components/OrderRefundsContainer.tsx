import Image from 'next/image';
import React, { useEffect, useState } from 'react'
import { ToastContainer,toast } from 'react-toastify';
import 'react-toastify/ReactToastify.css'

interface Image{
  url:string,
  publicId:string,
  assetId:string
}

interface RefundOrder{
  _id:string,
  userId:string,
  orderId:string,
  productId:string,
  status:string,
  order:{
    product:{
      rating:{
        rate:number,
        count:number
      },
      _id:string,
      title:string,
      price:number,
      description:string,
      category:string,
      image:string
    },
    quantity:number,
    productQtyPrice:number
  },
  selectedReason:string,
  providedReason:string,
  images:Image[]
}

const OrderRefundsContainer = ({clickedTab,refundObj}) => {
  const[refundedOrders,setRefundedOrders] = useState<RefundOrder[]>([]);

    const handleClickedTab = (tab:string)=>{
        clickedTab(tab)
    }

    useEffect(()=>{
      const fetchRefunds=async()=>{
        try {
           const res = await fetch('/api/orders/refundedOrder');
        const response = await res.json();
        if(response){
          setRefundedOrders(response.content);
        }
        } catch (error) {
          toast.error('Some error occurred!');
        }
      }
      fetchRefunds();
    },[]);

    const handleViewApplicationClick=(item:RefundOrder)=>{
      clickedTab('view_order_application');
      refundObj(item);
    }
  return (
    <div className='gap-2 flex flex-col w-full h-full px-5 md:p-0 relative'>
            <div className='top-0 w-full justify-between flex'>
                <button className='text-md text-black font-semibold bg-white border border-pink-300 rounded-md px-2'
                onClick={()=>handleClickedTab('ordersTab')}>Orders</button>
                <button className='text-md text-black font-semibold border border-pink-300 bg-white rounded-md px-2'
                onClick={()=>handleClickedTab('cancelled_orders_tab')}>Cancelled Orders</button>
                <button className='text-md text-black font-semibold border border-pink-300 bg-pink-300 rounded-md px-2'
                onClick={()=>handleClickedTab('refunds_tab')}>Refunds</button>
            </div>

            <div className='flex flex-col gap-2'>
              {refundedOrders.map((item,index)=>(
                <div key={index} className='bg-white h-max w-full rounded-lg shadow-lg p-5 flex items-center justify-between'>
                <Image src={item.order.product.image} alt='' width={100} height={100}/>
                <div className='flex flex-col gap-2'>
                  <p className='px-1 bg-orange-300 rounded-md w-max'>{item.status}</p>
                  <p className='text-gray-700 text-sm'>Date Here</p>
                </div>
                <div className='flex flex-col gap-3 justify-center'>
                  <p className='text-black text-sm font-medium'>{item.order.product.price} * {item.order.quantity}</p>
                  <p className='text-green-500 text-xl font-semibold'>${item.order.productQtyPrice}</p>
                </div>
                <div className='flex flex-col w-max gap-4'>
                  <p className='text-gray-700 text-sm font-semibold'>Id: {item._id}</p>
                  <button className='border border-pink-300 rounded-lg w-full text-black p-1'
                  onClick={()=>handleViewApplicationClick(item)}>View Application</button>
                </div>
              </div>
              ))}
            </div>


            <ToastContainer/>
    </div>
  )
}

export default OrderRefundsContainer
