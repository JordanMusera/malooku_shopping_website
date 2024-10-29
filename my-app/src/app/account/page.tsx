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

const page = () => {
    const [tab, setTab] = useState("edit_profile")
    const [orderObj,setOrderObj] = useState({});
    const [minMenuVisibility,setMinMenuVisibility] = useState(false);
    const [orderId,setOrderId] = useState('');

    const handleTabClick = (data: string) => {
        setTab(data);
        setMinMenuVisibility(false);
        console.log("Clicked_tab: " + data)
    }

    const handleOrderClick = (data:object)=>{
        setOrderObj(data);
        console.log("Clicked order: "+orderObj);
        setTab('viewOrderTab')
    }

    const minMenuClick=()=>{
        setMinMenuVisibility(priv=>(!priv))
    }

    const handleClickedOrder=(id:string)=>{
        setOrderId(id);
    }

    return (
        <div className='relative xl:grid xl:grid-cols-6 h-screen w-screen'>
            <div className='h-full col-span-1 justify-center items-center bg-white hidden md:flex'>
                <AccountMenu clikedTab={handleTabClick} />
            </div>

            <div className='h-full w-full absolute xl:col-span-1 flex-col justify-center items-center bg-white hidden'>
                <AccountMenu clikedTab={handleTabClick} />
            </div>

            <div className='col-span-4 h-full xl:p-10 overflow-auto bg-gray-100'>
                <div className='w-full h-12 bg-white fixed top-0 items-center shadow-lg flex xl:hidden z-10'>
                    <img src='/menu_icon.png' alt='' width={40} height={40} onClick={()=>minMenuClick()}/>
                    {minMenuVisibility &&( <div className='absolute h-screen w-screen flex items-center justify-center top-12 bg-white'>
                    <AccountMenu clikedTab={handleTabClick} />
                    </div>
                    )}
                </div>

                <div className='flex items-center justify-center h-full'>
                     {tab === "ordersTab" && (
                    <OrdersContainer clickedOrder={handleOrderClick} clickedTab={handleTabClick} orderId={handleClickedOrder}/>
                )}

                {tab === "edit_profile" && (
                    <AccountProfileContainer />
                )}

                {tab === "security" && (
                    <AccountSecurityContainer />
                )}

                {tab === "favouriteTab" && (
                    <FavouriteContainer />
                )}

                {tab === "viewOrderTab" && (
                    <ViewOrderContainer orderObj={orderObj} clickedTab={handleTabClick} />
                )}

                {tab === "trackorder" &&(
                    <TrackOrderContainer orderId={orderId}/>
                )}

                {tab ==='cancelled_orders_tab' &&(
                    <CancelledOrdersContainer clickedTab={handleTabClick}/>
                )}

                {tab ==='refunds_tab' &&(
                    <OrderRefundsContainer clickedTab={handleTabClick}/>
                )}

                {tab ==='refund_form_tab' &&(
                    <RefundFormContainer/>
                )}

                </div>
               
            </div>

        </div>
    )
}

export default page
