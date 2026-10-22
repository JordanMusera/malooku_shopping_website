'use client';
import { FormEvent, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { setShippingAddress, setPayments } from '@/store/userSlice';
import { setShippingAddress2, setPaymentInfo } from '@/store/orderSlice';
import { FiMapPin, FiPlus, FiTrash2, FiSmartphone, FiCheck } from 'react-icons/fi';
const emptyAddress = {county:'',city:'',street:'',postalCode:'',_id:''};
const emptyPayment = {accType:'mpesa',accName:'',accNumber:0,_id:''};
export default function OrderDetailsContainer({ busy, onBusy }: { busy:boolean; onBusy:(value:boolean)=>void }) {
  const dispatch = useDispatch();
  const { shippingAddress, paymentMethods } = useSelector((state:RootState) => state.user);
  const selected = useSelector((state:RootState) => state.order);
  const [addressOpen, setAddressOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [address, setAddress] = useState(emptyAddress);
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const addressReady = !!selected.shippingAddress2.city && !!selected.shippingAddress2.county;
  const paymentReady = selected.paymentMethod.accType === 'mpesa' && !!selected.paymentMethod.accNumber;
  const showAddressForm = addressOpen || shippingAddress.length === 0;
  const showPaymentForm = paymentOpen || !paymentMethods.some(item => item.accType === 'mpesa');
  async function change(kind:'shippingAddress'|'payment', method:'POST'|'DELETE', body:object) {
    onBusy(true); setError(''); setNotice('');
    try {
      const res = await fetch(`/api/users/update/${kind}`, {method,headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
      if (!res.ok) throw new Error('Unable to save your details. Please try again.');
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Unable to save your details.');
      if (kind === 'shippingAddress') {
        const items = data.content.shippingAddress || [];
        dispatch(setShippingAddress(items));
        const next = method === 'POST' ? items[items.length-1] : items.find((item:typeof emptyAddress) => item._id === selected.shippingAddress2._id) || items[0];
        dispatch(setShippingAddress2(next || emptyAddress));
        if (method === 'POST') { setAddressOpen(false); setAddress(emptyAddress); }
      } else {
        const items = data.content.paymentMethods || [];
        dispatch(setPayments(items));
        const next = method === 'POST' ? items[items.length-1] : items.find((item:typeof emptyPayment) => item._id === selected.paymentMethod._id) || items.find((item:typeof emptyPayment) => item.accType === 'mpesa');
        dispatch(setPaymentInfo(next || emptyPayment));
        if (method === 'POST') { setPaymentOpen(false); setName(''); setNumber(''); }
      }
      setNotice(method === 'POST' ? (kind === 'shippingAddress' ? 'Address saved. Next, confirm your M-Pesa number below.' : 'M-Pesa number saved. Review your total, then choose Pay to send the request.') : 'Saved details removed.');
      if (kind === 'shippingAddress' && method === 'POST' && !paymentReady) {
        setPaymentOpen(true);
        requestAnimationFrame(() => {
          document.getElementById('payment-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          document.getElementById('checkout-payment-name')?.focus({ preventScroll: true });
        });
      }
    } catch (error) { setError(error instanceof Error ? error.message : 'Something went wrong.'); }
    finally { onBusy(false); }
  }
  function savePayment(event:FormEvent) {
    event.preventDefault();
    let phone = number.replace(/[\s+-]/g,'');
    if (/^0[17]\d{8}$/.test(phone)) phone = `254${phone.slice(1)}`;
    if (!/^254[17]\d{8}$/.test(phone)) { setError('Enter a Kenyan M-Pesa number, for example 0712 345 678.'); return; }
    change('payment','POST',{paymentDetails:{accType:'mpesa',accName:name.trim(),accNumber:Number(phone)}});
  }
  return <div className="checkout-details">
    <div className="checkout-guide"><span className="eyebrow">BEFORE YOU PAY</span><h2>{addressReady && paymentReady ? 'Your details are ready.' : 'Complete these two steps.'}</h2><p>{addressReady && paymentReady ? 'Review your order, then send the payment request to your phone.' : 'Tell us where your order is going and which M-Pesa number you will use.'}</p><nav aria-label="Checkout progress" className="checkout-progress"><a href="#delivery-section" className={addressReady ? 'done' : 'current'}><span>{addressReady ? <FiCheck /> : '1'}</span>Delivery address<small>{addressReady ? 'Selected' : 'Required'}</small></a><a href="#payment-section" className={paymentReady ? 'done' : addressReady ? 'current' : ''}><span>{paymentReady ? <FiCheck /> : '2'}</span>M-Pesa number<small>{paymentReady ? 'Selected' : 'Required'}</small></a></nav></div>
    {error && <p role="alert" className="account-form-error">{error}</p>}{notice && <p role="status" className="checkout-notice">{notice}</p>}
    <section id="delivery-section" className="checkout-section" aria-labelledby="delivery-title"><div className="checkout-section-heading"><span className="checkout-step">01</span><div><h2 id="delivery-title">{addressReady ? 'Confirm your delivery address' : 'Where should your order go?'}</h2><p>Enter your county, town and street. Fields marked * are required.</p></div><span className={addressReady ? 'checkout-status done' : 'checkout-status'}>{addressReady ? <><FiCheck /> Selected</> : 'Required'}</span></div>
      <div className="checkout-choices">{shippingAddress.length === 0 && !showAddressForm && <p className="checkout-hint">No saved addresses yet. Add your delivery details below.</p>}{shippingAddress.map(item => <div className={`checkout-choice ${selected.shippingAddress2._id === item._id ? 'selected' : ''}`} key={item._id}><label><input type="radio" name="checkout-address" checked={selected.shippingAddress2._id === item._id} onChange={() => dispatch(setShippingAddress2(item))} disabled={busy} /><span><strong>{item.city}, {item.county}</strong><small>{[item.street,item.postalCode].filter(Boolean).join(', ')}</small></span></label><button type="button" className="choice-remove" aria-label={`Remove address in ${item.city}`} disabled={busy} onClick={() => change('shippingAddress','DELETE',{shippingAddressId:item._id})}><FiTrash2 /></button></div>)}</div>
      {!showAddressForm ? <button className="checkout-add" disabled={busy} onClick={() => setAddressOpen(true)}><FiPlus /> Add a new address</button> : <form id="checkout-address-form" className="checkout-inline-form" onSubmit={event => {event.preventDefault();change('shippingAddress','POST',{newShippingAddress:address});}}><h3>Delivery details</h3><fieldset disabled={busy} className="account-form-grid">{(['county','city','street','postalCode'] as const).map(field => <div className="account-field" key={field}><label htmlFor={`checkout-${field}`}>{({county:'County',city:'City or town',street:'Street address',postalCode:'Postal code (optional)'})[field]}{field !== 'postalCode' && <span className="required-mark" aria-hidden="true"> *</span>}</label><input id={`checkout-${field}`} placeholder={({county:'e.g. Nairobi',city:'e.g. Westlands',street:'Street, building and apartment',postalCode:'e.g. 00100'})[field]} required={field !== 'postalCode'} value={address[field]} onChange={event => setAddress(current => ({...current,[field]:event.target.value}))} autoComplete={({county:'address-level1',city:'address-level2',street:'street-address',postalCode:'postal-code'})[field]} /></div>)}</fieldset><div className="checkout-form-actions">{shippingAddress.length > 0 && <button type="button" className="checkout-cancel" disabled={busy} onClick={() => setAddressOpen(false)}>Cancel</button>}<button className="shop-button" disabled={busy} type="submit">{busy ? 'Saving...' : 'Save delivery address'}</button></div></form>}
    </section>
    <section id="payment-section" className="checkout-section payment-section" aria-labelledby="payment-title"><div className="checkout-section-heading"><span className="checkout-step">02</span><div><h2 id="payment-title">{paymentReady ? 'Confirm your M-Pesa number' : 'Which number will you pay with?'}</h2><p>Enter the phone number that should receive the M-Pesa payment request.</p></div><span className={paymentReady ? 'checkout-status done' : 'checkout-status'}>{paymentReady ? <><FiCheck /> Selected</> : 'Required'}</span></div>
      <div className="checkout-payment-banner"><img src="/mpesa_logo.svg" alt="M-Pesa" /><div><strong>Pay with M-Pesa</strong><p>Enter your M-Pesa PIN on your phone, never on this website.</p></div></div>
      <div className="checkout-choices">{paymentMethods.filter(item => item.accType === 'mpesa').map(item => <div className={`checkout-choice ${selected.paymentMethod._id === item._id ? 'selected' : ''}`} key={item._id}><label><input type="radio" name="checkout-payment" disabled={busy} checked={selected.paymentMethod._id === item._id} onChange={() => dispatch(setPaymentInfo(item))} /><span><strong>{item.accName}</strong><small>+{item.accNumber}</small></span></label><button className="choice-remove" aria-label={`Remove payment number ending ${String(item.accNumber).slice(-4)}`} disabled={busy} onClick={() => change('payment','DELETE',{paymentMethodId:item._id})}><FiTrash2 /></button></div>)}</div>
      {!showPaymentForm ? <button className="checkout-add" disabled={busy} onClick={() => setPaymentOpen(true)}><FiPlus /> Add an M-Pesa number</button> : <form id="checkout-payment-form" className="checkout-inline-form" onSubmit={savePayment}><h3>M-Pesa details</h3><p className="checkout-field-help">Saving your number does not send a payment request. You will confirm payment in the order summary.</p><fieldset disabled={busy} className="account-form-grid"><div className="account-field"><label htmlFor="checkout-payment-name">Account holder <span className="required-mark" aria-hidden="true">*</span></label><input required id="checkout-payment-name" autoComplete="name" placeholder="Full name on the M-Pesa account" value={name} onChange={event => setName(event.target.value)} /></div><div className="account-field"><label htmlFor="checkout-payment-phone">M-Pesa phone number <span className="required-mark" aria-hidden="true">*</span></label><input required type="tel" id="checkout-payment-phone" aria-describedby="mpesa-number-help" autoComplete="tel" placeholder="0712 345 678" value={number} onChange={event => setNumber(event.target.value)} /><small id="mpesa-number-help" className="checkout-field-help">Use 07XX XXX XXX, 01XX XXX XXX or 254...</small></div></fieldset><div className="checkout-form-actions">{paymentMethods.some(item => item.accType === 'mpesa') && <button type="button" className="checkout-cancel" disabled={busy} onClick={() => setPaymentOpen(false)}>Cancel</button>}<button className="shop-button" disabled={busy} type="submit">{busy ? 'Saving...' : 'Save M-Pesa number'}</button></div></form>}
    </section>
  </div>;
}