'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { setCart } from '@/store/cartSlice';
import { FiArrowRight, FiShoppingBag } from 'react-icons/fi';
export default function CheckoutCartContainer({ busy, onBusy }: {busy:boolean;onBusy:(value:boolean)=>void}) {
  const dispatch = useDispatch();
  const {cartItems,totalAmount} = useSelector((state:RootState) => state.cart);
  const {shippingAddress2,paymentMethod} = useSelector((state:RootState) => state.order);
  const [paymentId,setPaymentId]=useState('');
  const [settings,setSettings]=useState<{environment:string;testAmount:number|null}|null>(null);
  useEffect(()=>{fetch('/api/payments/config',{cache:'no-store'}).then(res=>{if(!res.ok)throw Error();return res.json();}).then(setSettings).catch(()=>setError('Unable to load payment settings. Please refresh.'));},[]);
  const [paying,setPaying] = useState(false);
  const [complete,setComplete] = useState(false);
  const [error,setError] = useState('');
  const pending = useRef(false);
  const ready = !!cartItems.length && !!shippingAddress2.city && !!shippingAddress2.county && paymentMethod.accType === 'mpesa' && !!paymentMethod.accNumber;
  function nextStep() {
    if (ready) { pay(); return; }
    const addressMissing = !shippingAddress2.city || !shippingAddress2.county;
    const section = document.getElementById(addressMissing ? 'delivery-section' : 'payment-section');
    section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    section?.querySelector<HTMLInputElement>('input:not(:disabled)')?.focus({ preventScroll: true });
  }
  async function pay() {
    if (!ready || busy || pending.current || !settings) return;
    pending.current=true;setPaying(true);onBusy(true);setError('');
    let id=paymentId;
    try{
      if(!id){const response=await fetch('/api/orders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({shippingAddress:shippingAddress2,paymentMethod})});const data=await response.json();if(!data.pending || !data.paymentId)throw Error(data.message||'Unable to send the payment request.');id=data.paymentId;setPaymentId(id);}
      for(let count=0;count<20;count++){
        await new Promise(resolve=>setTimeout(resolve,3000));
        const response=await fetch('/api/orders?paymentId='+encodeURIComponent(id),{cache:'no-store'});const data=await response.json();
        if(response.ok && data.success){setComplete(true);setPaymentId('');const cart=await fetch('/api/cart/user',{cache:'no-store'});if(cart.ok)dispatch(setCart(await cart.json()));return;}
        if(response.ok && !data.pending){setPaymentId('');throw Error(data.message||'Payment was not completed.');}
      }
      setError('Confirmation is taking longer than expected. Use Check payment status below; this will not send another request.');
    }catch(error){setError(error instanceof Error?error.message:'Unable to confirm payment. Please check its status.');}
    finally{pending.current=false;setPaying(false);onBusy(false);}
  }
  return <aside className="checkout-summary" aria-labelledby="summary-title"><div className="checkout-summary-heading"><h2 id="summary-title">Order summary</h2><span>{cartItems.reduce((total,item)=>total+item.orderedQty,0)} items</span></div>{complete ? <div className="checkout-summary-empty" role="status"><h3>Thank you for your order.</h3><p>{settings?.testAmount ? 'Your KSh '+settings.testAmount+' sandbox test payment was confirmed.' : 'Your payment was confirmed.'} You can find your order in your account.</p><Link className="shop-button" href="/account">View my account <FiArrowRight /></Link></div> : !cartItems.length ? <div className="checkout-summary-empty"><FiShoppingBag /><h3>Your bag is empty.</h3><p>Add something from the collection to get started.</p><Link className="shop-button" href="/#collection">Explore the collection</Link></div> : <><div className="checkout-summary-items">{cartItems.map(item => <div className="checkout-summary-item" key={item._id}><Link href={`/viewProduct/${item._id}`}><img src={item.images?.[0]?.imageUrl || item.image} alt={item.title} /></Link><div><Link href={`/viewProduct/${item._id}`}>{item.title}</Link><span>Quantity: {item.orderedQty}</span><strong>KSh {item.productQtyPrice.toLocaleString('en-KE')}</strong></div></div>)}</div><div className="checkout-totals"><p><span>Items subtotal</span><span>KSh {totalAmount.toLocaleString('en-KE')}</span></p><div><span>{settings?.testAmount ? "Cart total" : "Total payable"}</span><strong><small>KSh </small>{totalAmount.toLocaleString('en-KE')}</strong></div></div>{settings?.testAmount && <p className="checkout-notice" role="note">Sandbox testing: only KSh {settings.testAmount} will be requested on your phone. The full cart total is shown above.</p>}<button className="shop-button checkout-pay" disabled={busy || complete || !settings} onClick={nextStep}>{paying ? 'Waiting for payment...' : paymentId ? 'Check payment status' : !shippingAddress2.city || !shippingAddress2.county ? 'Enter delivery address' : !paymentMethod.accNumber || paymentMethod.accType !== 'mpesa' ? 'Enter M-Pesa number' : settings?.testAmount ? `Send KSh ${settings.testAmount} test payment` : `Pay KSh ${Math.ceil(totalAmount).toLocaleString('en-KE')} with M-Pesa`}{!paying && <FiArrowRight />}</button>{!ready && <p className="checkout-summary-note">Complete the required details first. This button takes you to the next step.</p>}{paying && <p role="status" className="checkout-summary-note">Check your phone and confirm the M-Pesa request.</p>}{error && <p role="alert" className="account-form-error">{error}</p>}<p className="checkout-summary-note">Review your items and details before confirming payment.</p></>}</aside>;
}