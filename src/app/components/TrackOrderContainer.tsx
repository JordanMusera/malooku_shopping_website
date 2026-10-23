'use client';
import React, { useEffect, useState } from 'react';
import { FiCheck } from 'react-icons/fi';
import { money, orderDate, OrderBack, OrderInfo } from './AccountOrderUI';
interface Progress {
  orderProgress: { orderStatus: string; date: string; description: string }[];
  totalCost: number;
  shippingAddress?: { postalCode?: string; street?: string; city?: string; county?: string };
  deliveryInfo?: { deliveryType?: string; pickupStation?: string };
}
export default function TrackOrderContainer({ orderId, clickedTab }: { orderId: string; clickedTab: (tab: string) => void }) {
  const [data, setData] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError(false);
    (async () => {
      try {
        if (!orderId) { setData(null); return; }
        const res = await fetch('/api/orders/orderProgress/' + orderId, { signal: controller.signal });
        if (!res.ok) throw new Error('Unable to load tracking');
        const response = await res.json(); setData(response.content || null);
      } catch { if (!controller.signal.aborted) setError(true); }
      finally { if (!controller.signal.aborted) setLoading(false); }
    })();
    return () => controller.abort();
  }, [orderId, attempt]);
  return <div className="account-order-view"><OrderBack onClick={() => clickedTab('ordersTab')} />
    {loading ? <p className="account-loading" role="status">Loading order progress…</p> : error ? <div className="account-empty" role="alert"><h3>Unable to load tracking.</h3><button className="shop-button" onClick={() => setAttempt(n => n + 1)}>Try again</button></div> : !data ? <div className="account-empty"><h3>Tracking isn’t available yet.</h3><p>Check back here for updates as your order moves along.</p></div> : <>
      <div className="account-order-overview"><div><p className="account-order-reference">Order #{orderId.slice(-8).toUpperCase()}</p><p className="account-order-muted">Follow your delivery</p></div><strong>{money(data.totalCost)}</strong></div>
      {data.orderProgress?.length ? <ol className="account-order-timeline">{data.orderProgress.map((step, index) => <li key={index}><span className="account-timeline-marker" aria-hidden="true"><FiCheck /></span><div><h3>{step.orderStatus}</h3><p className="account-order-muted">{orderDate(step.date)}</p><p>{step.description}</p></div></li>)}</ol> : <p className="account-order-muted">Your next delivery update will appear here.</p>}
      <div className="account-order-info-grid"><OrderInfo title="Delivery address"><p>{[data.shippingAddress?.street, data.shippingAddress?.city, data.shippingAddress?.county, data.shippingAddress?.postalCode].filter(Boolean).join(', ') || 'No delivery address available.'}</p></OrderInfo><OrderInfo title="Delivery method"><p>{data.deliveryInfo?.deliveryType || 'Standard delivery'}</p>{data.deliveryInfo?.pickupStation && <p>{data.deliveryInfo.pickupStation}</p>}</OrderInfo></div>
    </>}
  </div>;
}
