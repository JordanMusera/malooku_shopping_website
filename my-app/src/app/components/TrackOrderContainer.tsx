'use client'
import React, { useEffect, useState } from 'react'

interface OrderProgress {
    orderStatus: string,
    date: string,
    description: string
}

interface ShippingAddress {
    postalCode: string,
    street: string,
    city: string,
    county: string
}
interface DeliveryInfo {
    deliveryType: string,
    pickupStation: string
}
interface FetchedProgress {
    _id: string,
    orderId: string,
    orderProgress: OrderProgress[],
    totalCost: number,
    shippingAddress: ShippingAddress,
    deliveryInfo: DeliveryInfo
}

interface OrderId{
    orderId:string
}

const TrackOrderContainer = ({orderId}:OrderId) => {
    const [fetchedTrack, setFetchedTrack] = useState<FetchedProgress | null>(null);

    useEffect(() => {
        const fetchOrderTrack = async () => {
            const res = await fetch(`/api/orders/orderProgress/${orderId}`);
            const response = await res.json();
            setFetchedTrack(response.content);
        }
        fetchOrderTrack();
    }, [orderId])
    return (
        <div className='w-full h-full flex flex-col p-5 over'>
            <p className='text-xl text-black font-semibold'>Track Order</p>
            <div className='flex flex-col md:flex-row gap-2 justify-between'>
                <div className='text-md font-semibold text-gray-700 gap-2'>
                    <p>{fetchedTrack && fetchedTrack.orderProgress[0].date}</p>
                    <p>{fetchedTrack?._id}</p>
                </div>
                <p className='text-green-500 text-2xl font-semibold'>${fetchedTrack?.totalCost}</p>
            </div>

            <div className='mt-10'>
                {fetchedTrack && fetchedTrack.orderProgress.map((item) => (
                    <div>
                        <div className='flex w-max gap-1 mt-2'>
                            <div className='flex flex-col items-center justify-center w-max gap-1'>
                                <div className='w-5 h-5 rounded-full bg-pink-300 shadow-xl' />
                                {item.orderStatus != 'delivered' ? (
                                    <hr className='w-[2px] h-20 bg-pink-200 shadow-xl' />
                                ) : (
                                    <hr className='w-[10px] h-14 bg-green-400 rounded-lg shadow-xl' />
                                )}

                            </div>

                            <div className='flex'>
                                <div>
                                    <div className='flex flex-col gap-2'>
                                        <p className='text-md font-semibold text-black'>{item.orderStatus}</p>
                                        <p className='text-sm font-semibold text-gray-700'>{item.date}</p>
                                    </div>
                                    <p>{item.description}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

            </div>

            <div className='w-full h-max bg-white shadow-xl mt-10 rounded-lg p-5 flex flex-col md:flex-row items-center gap-2 justify-between'>
                <img src="/delivery_icon.svg" alt="" width={100} height={100} />
                <div className='text-md text-black font-semibold'>
                    {`${fetchedTrack?.shippingAddress.postalCode}, ${fetchedTrack?.shippingAddress.street}, ${fetchedTrack?.shippingAddress.city}, ${fetchedTrack?.shippingAddress.county}`}
                </div>
                <div className='flex text-green-500 font-bold text-md gap-2'>
                    <p className='text-gray-700'>{fetchedTrack?.deliveryInfo.deliveryType}: </p>
                    {`${fetchedTrack?.deliveryInfo.pickupStation}`}
                </div>
            </div>

        </div>
    )
}

export default TrackOrderContainer
