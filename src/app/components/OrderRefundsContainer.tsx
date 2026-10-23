'use client';
import React, { useEffect, useState } from 'react';
import { AccountOrderProduct, orderDate, OrderProductSummary, OrderStatus } from './AccountOrderUI';
export interface AccountRefund {
  _id: string; orderId: string; productId: string; status: string; order: AccountOrderProduct;
  selectedReason: string; providedReason: string; images?: { url: string }[];
  messages?: { message: string }[]; applicationDate: string;
}
export default function OrderRefundsContainer({ clickedTab, refundObj }: { clickedTab: (tab: string) => void; refundObj: (item: AccountRefund) => void }) {
  const [items, setItems] = useState<AccountRefund[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController(); setLoading(true); setError(false);
    (async () => { try {
      const res = await fetch('/api/orders/refundedOrder', { signal: controller.signal });
      if (!res.ok) throw new Error();
      const response = await res.json(); if (!Array.isArray(response.content)) throw new Error(); setItems(response.content);
    } catch { if (!controller.signal.aborted) setError(true); } finally { if (!controller.signal.aborted) setLoading(false); } })();
    return () => controller.abort();
  }, [attempt]);
  return <div className="account-orders">{loading ? <p className="account-loading" role="status">Loading refund requests…</p> : error ? <div className="account-empty" role="alert"><h3>Unable to load refund requests.</h3><button className="shop-button" onClick={() => setAttempt(n => n + 1)}>Try again</button></div> : !items.length ? <div className="account-empty"><h3>No refund requests.</h3><p>Your refund requests and their status will appear here.</p></div> : <div className="account-order-list">{items.map(item => <article className="account-order-card" key={item._id}>
    <div className="account-order-card-heading"><span>Requested {orderDate(item.applicationDate)}</span><OrderStatus status={item.status} /></div><OrderProductSummary item={item.order} /><div className="account-line-actions"><button className="account-order-button" onClick={() => { refundObj(item); clickedTab('view_order_application'); }}>View refund details</button></div>
  </article>)}</div>}</div>;
}
