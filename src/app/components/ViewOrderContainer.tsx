'use client';
import React, { useEffect, useRef, useState } from 'react';
import { AccountOrderProduct, money, orderDate, OrderBack, OrderInfo, OrderProductLink, OrderProductSummary, OrderStatus, OrderUnavailable } from './AccountOrderUI';

interface Order {
  _id: string; products: AccountOrderProduct[]; status: string; totalCost: number; orderDate: string;
  shippingAddress?: { postalCode?: string; street?: string; city?: string; county?: string };
  paymentMethod?: { accType?: string };
}
export default function ViewOrderContainer({ orderObj, clickedTab, handleCancelAndRefund }: {
  orderObj: Partial<Order>; clickedTab: (tab: string) => void;
  handleCancelAndRefund: (details: { orderId: string; product: AccountOrderProduct }) => void;
}) {
  const [selected, setSelected] = useState<AccountOrderProduct | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { if (selected) dialog.current?.showModal(); }, [selected]);
  if (!orderObj._id || !orderObj.products) return <OrderUnavailable onBack={() => clickedTab('ordersTab')} />;
  const cancel = async () => {
    if (!selected || busy) return;
    setBusy(true); setError('');
    try {
      const res = await fetch('/api/orders/refundedOrder', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId: selected.product._id, orderId: orderObj._id }) });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.message || 'Unable to cancel this item. Please try again.');
      dialog.current?.close(); clickedTab('cancelled_orders_tab');
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to cancel this item. Please try again.'); }
    finally { setBusy(false); }
  };
  return <div className="account-order-view">
    <OrderBack onClick={() => clickedTab('ordersTab')} />
    <div className="account-order-overview"><div><p className="account-order-reference">Order #{orderObj._id.slice(-8).toUpperCase()}</p><p className="account-order-muted">Placed {orderDate(orderObj.orderDate)}</p></div><OrderStatus status={orderObj.status || 'pending'} /></div>
    <div className="account-order-list">{orderObj.products.map((item, i) => <article className="account-order-card" key={item.product._id + i}>
      <OrderProductSummary item={item} />
      <div className="account-line-actions"><OrderProductLink id={item.product._id} /><button type="button" className="account-order-button" onClick={() => {
        if (orderObj.status === 'pending') { setError(''); setSelected(item); }
        else { handleCancelAndRefund({ orderId: orderObj._id!, product: item }); clickedTab('refund_form_tab'); }
      }}>{orderObj.status === 'pending' ? 'Cancel item' : 'Request a refund'}</button></div>
    </article>)}</div>
    <div className="account-order-info-grid"><OrderInfo title="Delivery address"><p>{[orderObj.shippingAddress?.street, orderObj.shippingAddress?.city, orderObj.shippingAddress?.county, orderObj.shippingAddress?.postalCode].filter(Boolean).join(', ') || 'No delivery address available.'}</p></OrderInfo><OrderInfo title="Order summary"><dl className="account-order-facts"><div><dt>Payment method</dt><dd>{orderObj.paymentMethod?.accType || 'M-Pesa'}</dd></div><div><dt>Total</dt><dd><strong>{money(orderObj.totalCost || 0)}</strong></dd></div></dl></OrderInfo></div>
    <dialog ref={dialog} className="account-cancel-dialog" onCancel={e => { if (busy) e.preventDefault(); }} onClose={() => setSelected(null)} aria-labelledby="cancel-item-title">
      <h3 id="cancel-item-title">Cancel this item?</h3><p>This item will be removed from your order.</p>{selected && <OrderProductSummary item={selected} />}
      {error && <p className="account-form-error" role="alert">{error}</p>}
      <div className="account-line-actions"><button type="button" className="account-order-button" disabled={busy} onClick={() => dialog.current?.close()}>Keep item</button><button type="button" className="account-order-button account-order-button-primary" disabled={busy} onClick={cancel}>{busy ? 'Cancelling…' : 'Confirm cancellation'}</button></div>
    </dialog>
  </div>;
}
