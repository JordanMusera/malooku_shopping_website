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


const OrdersContainer = () => {
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

    return (
        <div className='gap-2 flex flex-col'>
            {userOrders.length > 0 ? (
                userOrders.map((item, index) => (
                    <div key={index} className='w-full h-max bg-white rounded-lg p-5 relative flex justify-between items-center gap-2 shadow-lg'>
                        <div className='justify-between'>
                            <p className='text-white px-[5px] bg-pink-200 rounded-md w-max h-max'>{item.status}</p>
                            <p className='text-sm'>{item.orderDate}</p>
                        </div>

                        <div className='relative h-20 w-64'>
                            {item.products.map((item2, index) => (
                                <div key={index} className={`absolute h-20 z-${index} hover:z-40 cursor-pointer`} style={{ left: `${index * 20}px` }}>
                                    <Image
                                        src={item2.product.image}
                                        alt='Product Image'
                                        width={50}
                                        height={50}
                                        className='rounded-md shadow-lg w-12 h-20 object-cover'
                                    />
                                </div>
                            ))}
                        </div>



                        <div className='flex flex-col justify-between items-center'>
                            <p className="text-gray-500 text-sm font-bold"><span>Id:</span><span>{item._id}</span></p>
                            <p className="text-green-500 text-xl font-bold">${item.totalCost}</p>
                        </div>

                        <div className='flex flex-col gap-2'>
                            <button className='w-max h-max rounded-sm p-1 bg-green-400 font-serif text-white'>Track Order</button>
                            <button className='w-max h-max rounded-sm p-1 bg-white border border-green-300 font-serif text-black'>View Order</button>
                        </div>

                    </div>
                ))
            ) : (
                <p>No orders found</p>
            )}
        </div>
    );
};

export default OrdersContainer;
