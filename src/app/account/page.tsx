'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Topbar from '../components/Topbar'
import Footer from '../components/Footer'
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
import NotificationsContainer from '../components/NotificationsContainer'
import ReviewContainer from '../components/ReviewedContainer'
import PendingReview from '../components/PendingReview'
import PostReviewContainer from '../components/PostReviewContainer'
import ViewReviewContainer from '../components/ViewReviewContainer'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@/store/store'
import { setClickedTab } from '@/store/tabSlice'

const AccountPage = () => {
    const [tab, setTab] = useState("edit_profile")
    const [orderObj, setOrderObj] = useState({});

    const [orderId, setOrderId] = useState('');
    const [productId, setProductId] = useState('');
    const [CARorderDetails, setCARorderDetails] = useState({});
    const [clickedRefund, setClickedRefund] = useState({});

    const dispatch = useDispatch();
    const { clickedTab } = useSelector(
        (state: RootState) => state.acc_clicked_tab
    );

    useEffect(() => {
        setTab(clickedTab);
    }, []);



    const handleTabClick = (data: string) => {
        setTab(data);

        dispatch(setClickedTab(data))
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


    const handleClickedOrder = (id: string) => {
        setOrderId(id);
    }

    const setClickedRefundFn = (item: Object) => {
        setClickedRefund(item)
    }


    const titles: Record<string, string> = {
        edit_profile: 'Personal information', security: 'Account security', favouriteTab: 'Saved items',
        ordersTab: 'My orders', viewOrderTab: 'Order details', trackorder: 'Track your order',
        cancelled_orders_tab: 'My orders', refunds_tab: 'My orders', refund_form_tab: 'Request a refund',
        view_order_application: 'Refund details', notifications_tab: 'Notifications',
        pending_review_tab: 'Your reviews', reviewed_tab: 'Your reviews', review_tab: 'Write a review', view_review_tab: 'Review details'
    };
    return (
        <div className="account-page">
            <div className="store-header"><Topbar /></div>
            <main className="shop-container">
                <nav className="product-breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><span aria-current="page">My account</span></nav>
                <div className="account-heading"><div><h1>My account</h1><p>Your details, orders and saved items.</p></div><Link href="/#collection" className="account-back">Continue shopping <span aria-hidden="true">&rarr;</span></Link></div>
                <div className="account-layout">
                    <aside className="account-sidebar"><AccountMenu clikedTab={handleTabClick} activeTab={tab} /></aside>
                    <section className="account-panel" aria-labelledby="account-section-title">
                        <div className="account-panel-heading"><h2 id="account-section-title">{titles[tab] || 'My account'}</h2></div>
                        <div className="account-panel-content">
                            {['pending_review_tab', 'reviewed_tab'].includes(tab) && (
                                <nav className="account-subtabs order-category-tabs review-category-tabs" aria-label="Review categories">
                                    {[
                                        { id: 'pending_review_tab', label: 'Pending' },
                                        { id: 'reviewed_tab', label: 'Reviewed' },
                                    ].map(category => (
                                        <button key={category.id} aria-current={tab === category.id ? 'page' : undefined} onClick={() => handleTabClick(category.id)}>{category.label}</button>
                                    ))}
                                </nav>
                            )}
                            {['ordersTab', 'cancelled_orders_tab', 'refunds_tab'].includes(tab) && (
                                <nav className="account-subtabs order-category-tabs" aria-label="Order categories">
                                    {[
                                        { id: 'ordersTab', label: 'All orders' },
                                        { id: 'cancelled_orders_tab', label: 'Cancelled' },
                                        { id: 'refunds_tab', label: 'Refunds' },
                                    ].map(category => (
                                        <button key={category.id} aria-current={tab === category.id ? 'page' : undefined} onClick={() => handleTabClick(category.id)}>{category.label}</button>
                                    ))}
                                </nav>
                            )}
                    {tab === "ordersTab" && <OrdersContainer clickedOrder={handleOrderClick} clickedTab={handleTabClick} orderId={handleClickedOrder} />}
                    {tab === "edit_profile" && <AccountProfileContainer />}
                    {tab === "security" && <AccountSecurityContainer />}
                    {tab === "favouriteTab" && <FavouriteContainer />}
                    {tab === "viewOrderTab" && <ViewOrderContainer orderObj={orderObj} clickedTab={handleTabClick} handleCancelAndRefund={handleCancelAndRefund} />}
                    {tab === "trackorder" && <TrackOrderContainer orderId={orderId} clickedTab={handleTabClick} />}
                    {tab === 'cancelled_orders_tab' && <CancelledOrdersContainer clickedTab={handleTabClick} />}
                    {tab === 'refunds_tab' && <OrderRefundsContainer clickedTab={handleTabClick} refundObj={setClickedRefundFn} />}
                    {tab === 'refund_form_tab' && <RefundFormContainer orderDetails={CARorderDetails} />}
                    {tab === 'view_order_application' && <ViewRefundApplicationContainer clickedRefund={clickedRefund} clickedTab={handleTabClick} />}
                    {tab === 'notifications_tab' && <NotificationsContainer />}
                    {tab === 'pending_review_tab' && <PendingReview clickedTab={handleTabClick} productId={setProductId} />}
                    {tab === 'reviewed_tab' && <ReviewContainer clickedTab={handleTabClick} productId={setProductId} />}
                    {tab === 'review_tab' && <PostReviewContainer productId={productId} clickedTab={handleTabClick} />}
                    {tab === 'view_review_tab' && <ViewReviewContainer productId={productId} clickedTab={handleTabClick} />}
                        </div>
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
};
export default AccountPage;