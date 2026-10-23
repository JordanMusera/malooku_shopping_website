'use client';
import React, { useEffect, useState } from 'react';
import { AccountOrderProduct, orderDate, OrderProductLink, OrderProductSummary, OrderStatus } from './AccountOrderUI';
interface CancelledOrder extends AccountOrderProduct { _id: string; productId: string; orderId: string; status: string; cancellationDate: string; }
export default function CancelledOrdersContainer({ clickedTab }: { clickedTab: (tab: string) => void }) {
  const [items, setItems] = useState<CancelledOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController(); setLoading(true); setError(false);
    (async () => { try {
      const res = await fetch('/api/orders/cancelledOrder', { signal: controller.signal });
      if (!res.ok) throw new Error();
      const response = await res.json(); if (!Array.isArray(response)) throw new Error(); setItems(response);
    } catch { if (!controller.signal.aborted) setError(true); } finally { if (!controller.signal.aborted) setLoading(false); } })();
    return () => controller.abort();
  }, [attempt]);
  return <div className="account-orders">{loading ? <p className="account-loading" role="status">Loading cancelled orders…</p> : error ? <div className="account-empty" role="alert"><h3>Unable to load cancelled orders.</h3><button className="shop-button" onClick={() => setAttempt(n => n + 1)}>Try again</button></div> : !items.length ? <div className="account-empty"><h3>No cancelled orders.</h3><p>Any items you cancel will appear here.</p></div> : <div className="account-order-list">{items.map(item => <article className="account-order-card" key={item._id}>
    <div className="account-order-card-heading"><span>{orderDate(item.cancellationDate)}</span><OrderStatus status={item.status || 'cancelled'} /></div><OrderProductSummary item={item} /><div className="account-line-actions"><OrderProductLink id={item.productId} /></div>
  </article>)}</div>}</div>;
}
