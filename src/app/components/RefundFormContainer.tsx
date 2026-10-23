'use client';
import React, { useEffect, useState } from 'react';
import { AccountOrderProduct, OrderBack, OrderProductSummary, OrderUnavailable } from './AccountOrderUI';
interface RefundDetails { orderId?: string; product?: AccountOrderProduct; }
export default function RefundFormContainer({ orderDetails, clickedTab }: { orderDetails: RefundDetails; clickedTab: (tab: string) => void }) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  useEffect(() => {
    const urls = files.map(file => URL.createObjectURL(file)); setPreviews(urls);
    return () => urls.forEach(url => URL.revokeObjectURL(url));
  }, [files]);
  if (!orderDetails.product || !orderDetails.orderId) return <OrderUnavailable onBack={() => clickedTab('ordersTab')} />;
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); if (busy) return; setBusy(true); setError('');
    const data = new FormData(); files.forEach(file => data.append('images', file));
    data.append('selectedReason', reason); data.append('providedReason', details);
    data.append('orderId', orderDetails.orderId!); data.append('productId', orderDetails.product!.product._id);
    try {
      const res = await fetch('/api/orders/refundedOrder/refundApplication', { method: 'POST', body: data });
      const result = await res.json(); if (!res.ok || !result.success) throw new Error(result.message || 'Unable to submit your request. Please try again.'); setSubmitted(true);
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to submit your request. Please try again.'); } finally { setBusy(false); }
  };
  return <div className="account-order-view"><OrderBack onClick={() => clickedTab(submitted ? 'refunds_tab' : 'viewOrderTab')}>{submitted ? 'Back to refunds' : 'Back to order'}</OrderBack>
    {submitted ? <div className="account-empty" role="status"><h3>Refund request submitted.</h3><p>Follow its progress in the Refunds tab.</p><button className="shop-button" onClick={() => clickedTab('refunds_tab')}>View refunds</button></div> : <>
      <p className="account-order-muted">Tell us what went wrong so we can review your request.</p><div className="account-order-card"><OrderProductSummary item={orderDetails.product} /></div>
      <form className="account-refund-form" onSubmit={submit}><div className="account-field"><label htmlFor="refund-reason">Reason for return</label><select id="refund-reason" value={reason} onChange={e => setReason(e.target.value)} required><option value="" disabled>Select a reason</option>{['Damaged or defective item', 'Wrong item received', 'Item differs from description', 'Other'].map(value => <option key={value}>{value}</option>)}</select></div>
        <div className="account-field"><label htmlFor="refund-details">Additional details</label><textarea id="refund-details" value={details} onChange={e => setDetails(e.target.value)} maxLength={500} rows={5} placeholder="Describe the issue with your item" /><p className="account-order-muted">{details.length}/500 characters</p></div>
        <div className="account-field"><label htmlFor="refund-photos">Attach photos <span>(optional)</span></label><input id="refund-photos" type="file" accept="image/*" multiple onChange={e => setFiles(Array.from(e.target.files || []))} /><p className="account-order-muted">Add clear photos to help us review the issue.</p></div>
        {!!previews.length && <div className="account-refund-photos">{previews.map((src, index) => <div key={src}><img src={src} alt={'Selected photo ' + (index + 1)} /><button type="button" className="account-order-button" onClick={() => setFiles(previous => previous.filter((_, i) => i !== index))}>Remove photo {index + 1}</button></div>)}</div>}
        {error && <p className="account-form-error" role="alert">{error}</p>}<div className="account-line-actions"><button className="account-order-button account-order-button-primary" type="submit" disabled={busy}>{busy ? 'Submitting…' : 'Submit refund request'}</button></div>
      </form>
    </>}
  </div>;
}
