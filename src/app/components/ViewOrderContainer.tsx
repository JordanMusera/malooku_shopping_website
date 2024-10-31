import React, { useEffect } from 'react'
import Order from '../models/order';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface Product {
    rating: {
        rate: number;
        count: number;
    };
    _id: string;
    id: number;
    title: string;
    price: number;
    description: string;
    category: string;
    image: string;
}

interface OrderProduct {
    [x: string]: ReactNode;
    product: Product;
    quantity: number;
    productQtyPrice: number;
}

interface Order {
    shippingAddress: {
        postalCode: string;
        street: string;
        city: string;
        county: string;
    };
    paymentMethod: {
        accType: string;
        accNumber: number;
        accName: string;
    };
    deliveryInfo: {
        deliveryType: string;
        pickupStation: string;
    };
    _id: string;
    userId: string;
    products: OrderProduct[];
    totalCost: number;
    status: string;
    orderDate: string;
}

const ViewOrderContainer = ({orderObj,clickedTab,handleCancelAndRefund}) => {
    const router = useRouter();

   const viewProduct=(id:string)=>{
    router.push(`/viewProduct/${id}`)
   }

   const cancelAndRefund=(orderProduct:OrderProduct)=>{
    clickedTab('refund_form_tab');
    const orderDetails = {
        orderId:orderObj._id,
        product:orderProduct
    }
    handleCancelAndRefund(orderDetails);
   }

  return (
    <div>

<div className='gap-2 flex flex-col'>
    
        {orderObj.products.map((item,index)=>(
            <div key={index} className='bg-white rounded-xl h-max p-5 flex justify-between items-center w-full'>
                <Image src={item.product.image} alt='' width={80} height={80}
                className='object-cover rounded-xl shadow-lg mr-5'/>
                <div className='w-1/3'>
                    <p className='text-sm text-black font-bold'>{item.product.title}</p>
                    <p className='text-sm text-gray-600 font-bold flex gap-2'><span>Price:</span><span className='text-orange-400'>${item.product.price}</span></p>
                    <p className='text-sm text-gray-600 font-bold flex gap-2'><span>Qty:</span><span className='text-red-400'>{item.quantity}</span></p>
                    <p className='text-sm text-gray-600 font-bold flex gap-2'><span>Cost:</span><span className='text-green-400'>${item.productQtyPrice}</span></p>
                </div>
                <div className='flex flex-col gap-2'>
                <p className='text-sm text-gray-600 font-bold flex gap-2'><span>Id:</span><span className='text-pink-400'>{item.product._id}</span></p>

                <div className='flex flex-col gap-2'>
                            <button className='w-full h-max rounded-sm p-1 bg-green-400 font-serif text-white'
                            onClick={()=>viewProduct(item.product._id)}>View Product</button>
                            <button className='w-full h-max rounded-sm p-1 bg-white border border-green-300 font-serif text-black hover:bg-red-400'
                            onClick={()=>cancelAndRefund(item)}>Cancel and refund</button>
                        </div>
                </div>
            </div>
        ))}
</div>
      
    </div>
  )
}

export default ViewOrderContainer
