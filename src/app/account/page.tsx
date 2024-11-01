'use client'
import React, { useEffect, useState } from 'react'
import AccountMenu from '../components/AccountMenu'
import AccountProfileContainer from '../components/EditProfileContainer'
import AccountSecurityContainer from '../components/AccountSecurityContainer'
import FavouriteContainer from '../components/FavouriteContainer'
import OrdersContainer from '../components/OrdersContainer'
import ViewOrderContainer from '../components/ViewOrderContainer'
import TrackOrderContainer from '../components/TrackOrderContainer'
import CancelledOrdersContainer from '../components/CancelledOrdersContainer'
import OrderRefundsContainer from '../components/OrderRefundsContainer'
import RefundFormContainer from '../components/RefundFormContainer'
import ViewRefundApplicationContainer from '../components/ViewRefundApplicationContainer'

const page = () => {
    const [tab, setTab] = useState("edit_profile")
    const [orderObj, setOrderObj] = useState({});
    const [minMenuVisibility, setMinMenuVisibility] = useState(false);
    const [orderId, setOrderId] = useState('');
    const [CARorderDetails, setCARorderDetails] = useState({});
    const [clickedRefund, setClickedRefund] = useState({});

    const handleTabClick = (data: string) => {
        setTab(data);
        setMinMenuVisibility(false);
        console.log("Clicked_tab: " + data)
    }

    const handleCancelAndRefund = (data: any) => {
        setCARorderDetails(data);
    }

    const handleOrderClick = (data: object) => {
        setOrderObj(data);
        console.log("Clicked order: " + orderObj);
        setTab('viewOrderTab')
    }

    const minMenuClick = () => {
        setMinMenuVisibility(priv => (!priv))
    }

    const handleClickedOrder = (id: string) => {
        setOrderId(id);
    }

    const setClickedRefundFn = (item: Object) => {
        setClickedRefund(item)
    }

    return (
        <div className='relative grid grid-cols-1 xl:grid-cols-6 h-screen w-screen'>
        <div className='h-full col-span-1 justify-center items-center bg-pink-100 hidden xl:flex'>
            <AccountMenu clikedTab={handleTabClick} />
        </div>
    
        <div className='flex w-full col-span-1 xl:col-span-4 h-full xl:p-10 overflow-auto bg-gray-100'>
            <div className='w-1/6 h-screen bg-white flex flex-col items-center justify-center shadow-lg xl:hidden rounded-r-2xl'>
            <AccountMenu clikedTab={handleTabClick} />
            </div>
    
            <div className='flex items-center justify-center h-full w-5/6 xl:w-full'>
                {tab === "ordersTab" && <OrdersContainer clickedOrder={handleOrderClick} clickedTab={handleTabClick} orderId={handleClickedOrder} />}
                {tab === "edit_profile" && <AccountProfileContainer />}
                {tab === "security" && <AccountSecurityContainer />}
                {tab === "favouriteTab" && <FavouriteContainer />}
                {tab === "viewOrderTab" && <ViewOrderContainer orderObj={orderObj} clickedTab={handleTabClick} handleCancelAndRefund={handleCancelAndRefund} />}
                {tab === "trackorder" && <TrackOrderContainer orderId={orderId} />}
                {tab === 'cancelled_orders_tab' && <CancelledOrdersContainer clickedTab={handleTabClick} />}
                {tab === 'refunds_tab' && <OrderRefundsContainer clickedTab={handleTabClick} refundObj={setClickedRefundFn} />}
                {tab === 'refund_form_tab' && <RefundFormContainer orderDetails={CARorderDetails} />}
                {tab === 'view_order_application' && <ViewRefundApplicationContainer clickedRefund={clickedRefund} />}
            </div>
        </div>
    </div>
    
    )
}

export default page
