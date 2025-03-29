import Image from 'next/image';
import React, { useEffect, useState } from 'react';

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
    images: any
}

interface OrderProduct {
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


const OrdersContainer = ({ clickedOrder, clickedTab, orderId }:any) => {
    const [userOrders, setUserOrders] = useState<Order[]>([]);
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await fetch('/api/orders');
                const response = await res.json();
                if (response.success) {
                    setUserOrders(response.content);
                } else {
                    console.error('Failed to fetch orders:', response.error);
                }
            } catch (error) {
                console.error('Error fetching orders:', error);
            }
        };

        fetchOrders();
    }, []);

    const handleClickedViewTab = (order: Order) => {
        clickedOrder(order);
    }

    const handleTrackOrder = (tab1: string, id: string) => {
        clickedTab(tab1);
        orderId(id);
    }

    const handleClickedTab = (tab:string)=>{
        clickedTab(tab)
    }

    return (
        <div className='gap-2 flex flex-col w-full h-full p-3 md:p-5 relative'>
            <div className='top-0 w-full md:w-max h-10 justify-between flex md:px-5 gap-2'>
                <button className='text-md w-full text-black font-semibold bg-pink-300 border border-pink-300 rounded-md px-2'
                onClick={()=>handleClickedTab('ordersTab')}>Orders</button>
                <button className='text-md w-full text-black font-semibold border border-pink-300 bg-white rounded-md px-2'
                onClick={()=>handleClickedTab('cancelled_orders_tab')}>Cancelled</button>
                <button className='text-md w-full text-black font-semibold border border-pink-300 bg-white rounded-md px-2'
                onClick={()=>handleClickedTab('refunds_tab')}>Refunds</button>
            </div>

            <div className='gap-2 flex flex-col w-full md:px-5 md:p-0 overflow-auto items-center justify-start max-h-[calc(100vh-100px)]'>
                {userOrders.length > 0 ? (
                    userOrders.map((item, index) => (
                        <div key={index} className='w-full h-max bg-white rounded-lg p-5 relative flex flex-col md:flex-row justify-between items-center gap-2 shadow-lg'>
                            <div className='h-32 w-full justify-center flex'>
                                {item.products.map((item2, index) => (
                                    <div key={index} className={`h-32 z-${index} hover:z-40 cursor-pointer`} style={{ left: `${index * 20}px` }}>
                                        <Image
                                            src={item2.product.images[0].imageUrl}
                                            alt='Product Image'
                                            width={50}
                                            height={50}
                                            className='rounded-md shadow-lg w-max h-32 object-cover'
                                        />
                                    </div>
                                ))}
                            </div>
                            <div className='w-full flex md:flex-col gap-3'>
                                <p className='text-black px-[5px] bg-orange-300 rounded-md w-max h-max'>{item.status}</p>
                                <p className='text-sm w-max'>{item.orderDate}</p>
                            </div>

                            



                            <div className='flex flex-col items-center w-full justify-center'>
                                <p className="text-gray-700 text-sm font-medium w-full"><span>Id:</span><span>{item._id}</span></p>
                                <p className="text-green-500 text-xl font-semi-bold w-max">${item.totalCost}</p>
                            </div>

                            <div className='flex flex-col gap-2 w-full md:justify-end'>
                                <button className='w-full h-max rounded-md p-1 bg-pink-300 font-serif text-white'
                                    onClick={() => handleTrackOrder('trackorder', item._id)}>Track Order</button>
                                <button className='w-full h-max rounded-md p-1 bg-white border border-pink-300 font-serif text-black'
                                    onClick={() => handleClickedViewTab(item)}>View Order</button>
                            </div>

                        </div>
                    ))
                ) : (
                    <div className='w-full h-full flex justify-center items-center'>
                        <p className='w-full'>No orders found</p>
                    </div>

                )}
            </div>

        </div>
    );
};

export default OrdersContainer;
