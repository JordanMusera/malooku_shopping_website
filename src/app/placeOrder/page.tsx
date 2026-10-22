'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setCart, waitForCartWrites } from '@/store/cartSlice';
import { setShippingAddress, setPayments } from '@/store/userSlice';
import { setShippingAddress2, setPaymentInfo } from '@/store/orderSlice';
import OrderDetailsContainer from '../components/OrderDetailsContainer';
import CheckoutCartContainer from '../components/CheckoutCartContainer';
import Topbar from '../components/Topbar';
import Footer from '../components/Footer';
export default function CheckoutPage() {
  const dispatch = useDispatch();
  const [status, setStatus] = useState<'loading'|'ready'|'signin'|'error'>('loading');
  const [attempt, setAttempt] = useState(0);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    setStatus('loading');
    async function load() {
      try {
        await waitForCartWrites();
        const cartResponse = await fetch('/api/cart/user', { cache: 'no-store', signal: controller.signal });
        if (cartResponse.status === 401) { setStatus('signin'); return; }
        if (!cartResponse.ok) throw new Error();
        const cart = await cartResponse.json();
        const response = await fetch('/api/users', { cache: 'no-store', signal: controller.signal });
        if (!response.ok) throw new Error();
        const data = await response.json();
        if (!data.success || !Array.isArray(cart.cartData)) throw new Error();
        const addresses = data.user.shippingAddress || [];
        const payments = data.user.paymentMethods || [];
        dispatch(setCart(cart));
        dispatch(setShippingAddress(addresses));
        dispatch(setPayments(payments));
        dispatch(setShippingAddress2(addresses[0] || {county:'',city:'',street:'',postalCode:'',_id:''}));
        dispatch(setPaymentInfo(payments.find((p: {accType:string}) => p.accType === 'mpesa') || {accType:'mpesa',accNumber:0,accName:'',_id:''}));
        setStatus('ready');
      } catch (error) { if (!controller.signal.aborted) setStatus('error'); }
    }
    load();
    return () => controller.abort();
  }, [attempt, dispatch]);
  return <div className="checkout-page"><div className="store-header"><Topbar /></div><main className="shop-container"><nav className="product-breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><span aria-current="page">Checkout</span></nav><div className="account-heading"><div><span className="eyebrow">THE FINAL DETAILS</span><h1>Checkout</h1><p>Add your delivery address and M-Pesa number, then review and pay.</p></div><Link className="account-back" href="/#collection">Continue shopping <span aria-hidden="true">&rarr;</span></Link></div>{status === 'loading' ? <div className="checkout-loading" role="status">Preparing your checkout...</div> : status === 'signin' ? <div className="account-empty"><h2>Sign in to continue.</h2><p>Your bag and saved details are linked to your account.</p><Link href="/login" className="shop-button">Sign in</Link></div> : status === 'error' ? <div className="account-empty" role="alert"><h2>We couldn’t load checkout.</h2><p>Please try again in a moment.</p><button className="shop-button" onClick={() => setAttempt(n => n + 1)}>Try again</button></div> : <div className="checkout-layout"><OrderDetailsContainer busy={busy} onBusy={setBusy} /><CheckoutCartContainer busy={busy} onBusy={setBusy} /></div>}</main><Footer /></div>;
}