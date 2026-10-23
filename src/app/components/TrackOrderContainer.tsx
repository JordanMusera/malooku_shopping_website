'use client';
import React, { useEffect, useState } from 'react';
import { FiCheck } from 'react-icons/fi';
import { money, orderDate, OrderBack, OrderInfo, OrderStatus } from './AccountOrderUI';
interface Progress {
  status: string;
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
  const [refreshError, setRefreshError] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    let busy = false;
    setData(null); setLoading(true); setError(false); setRefreshError(false);
    const refresh = async (initial = false) => {
      if (busy || controller.signal.aborted) return;
      busy = true;
      try {
        if (!orderId) { setData(null); return; }
        const res = await fetch('/api/orders/orderProgress/' + orderId, { cache: 'no-store', signal: controller.signal });
        if (!res.ok) throw new Error('Unable to load tracking');
        const response = await res.json();
        if (!response.success) throw new Error(response.message || 'Unable to load tracking');
        setData(response.content || null); setError(false); setRefreshError(false);
      } catch {
        if (!controller.signal.aborted) { if (initial) setError(true); else setRefreshError(true); }
      } finally {
        busy = false;
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    const onVisible = () => { if (document.visibilityState === 'visible') void refresh(); };
    void refresh(true);
    const timer = window.setInterval(onVisible, 15000);
    window.addEventListener('focus', onVisible);
    document.addEventListener('visibilitychange', onVisible);
    return () => { controller.abort(); window.clearInterval(timer); window.removeEventListener('focus', onVisible); document.removeEventListener('visibilitychange', onVisible); };
  }, [orderId, attempt]);
  return <div className="account-order-view"><OrderBack onClick={() => clickedTab('ordersTab')} />
    {loading ? <p className="account-loading" role="status">Loading order progress…</p> : error ? <div className="account-empty" role="alert"><h3>Unable to load tracking.</h3><button className="shop-button" onClick={() => setAttempt(n => n + 1)}>Try again</button></div> : !data ? <div className="account-empty"><h3>Tracking isn’t available yet.</h3><p>Check back here for updates as your order moves along.</p></div> : <>
      <div className="account-order-overview"><div><p className="account-order-reference">Order #{orderId.slice(-8).toUpperCase()}</p><p className="account-order-muted">Updates automatically while this page is open.</p></div><OrderStatus status={data.status} /><strong>{money(data.totalCost)}</strong></div>
      {refreshError && <p className="account-order-muted" role="status">Couldn’t refresh tracking. Showing the last saved update; retrying shortly.</p>}
      {data.orderProgress?.length ? <ol className="account-order-timeline">{data.orderProgress.map((step, index) => <li key={index} aria-current={index === data.orderProgress.length - 1 ? 'step' : undefined}><span className="account-timeline-marker" aria-hidden="true"><FiCheck /></span><div><h3>{step.orderStatus}</h3><p className="account-order-muted">{step.date ? orderDate(step.date) : 'Current saved status'}</p><p>{step.description}</p></div></li>)}</ol> : <p className="account-order-muted">Your next delivery update will appear here.</p>}
      <div className="account-order-info-grid"><OrderInfo title="Delivery address"><p>{[data.shippingAddress?.street, data.shippingAddress?.city, data.shippingAddress?.county, data.shippingAddress?.postalCode].filter(Boolean).join(', ') || 'No delivery address available.'}</p></OrderInfo><OrderInfo title="Delivery method"><p>{data.deliveryInfo?.deliveryType || 'Standard delivery'}</p>{data.deliveryInfo?.pickupStation && <p>{data.deliveryInfo.pickupStation}</p>}</OrderInfo></div>
    </>}
  </div>;
}
