import Link from 'next/link';
import { FiShoppingBag } from 'react-icons/fi';
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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [attempt, setAttempt] = useState(0);
    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true); setError(false);
            try {
                const res = await fetch('/api/orders');
                if (!res.ok) throw new Error();
                const response = await res.json();
                if (response.success) {
                    setUserOrders(response.content);
                } else {
                    setError(true);
                }
            } catch (error) {
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [attempt]);

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
      <div className="account-orders">
        {loading ? <p className="account-loading" role="status">Loading your orders...</p> : error ? <div className="account-empty" role="alert"><h3>Unable to load orders.</h3><p>Please give it another try.</p><button className="shop-button" onClick={() => setAttempt(n => n + 1)}>Try again</button></div> : userOrders.length === 0 ? <div className="account-empty"><FiShoppingBag /><h3>Your next find starts here.</h3><p>You haven’t placed an order yet. Explore the collection and find something for your everyday.</p><Link className="shop-button" href="/#collection">Explore the collection</Link></div> : userOrders.map(item => <article className="account-order" key={item._id}><div className="account-order-top"><span>Order #{item._id.slice(-8).toUpperCase()}</span><span>{item.orderDate}</span></div><div className="account-order-body"><div className="account-order-images">{item.products.slice(0,3).map((entry,index) => <img key={index} src={entry.product.images?.[0]?.imageUrl || entry.product.image} alt={entry.product.title} />)}</div><div><p>{item.status}</p><p>{item.products.length} {item.products.length === 1 ? 'item' : 'items'}</p><strong>KSh {item.totalCost.toLocaleString('en-KE')}</strong></div></div><div className="account-order-actions"><button onClick={() => handleClickedViewTab(item)}>View order</button><button onClick={() => handleTrackOrder('trackorder',item._id)}>Track order</button></div></article>)}
      </div>
    );
};
export default OrdersContainer;