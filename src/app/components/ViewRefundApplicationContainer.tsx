'use client';
import React from 'react';
import type { AccountRefund } from './OrderRefundsContainer';
import { orderDate, OrderBack, OrderInfo, OrderProductSummary, OrderStatus, OrderUnavailable } from './AccountOrderUI';
export default function ViewRefundApplicationContainer({ clickedRefund, clickedTab }: { clickedRefund: Partial<AccountRefund>; clickedTab: (tab: string) => void }) {
  if (!clickedRefund.order) return <OrderUnavailable onBack={() => clickedTab('refunds_tab')} />;
  return <div className="account-order-view"><OrderBack onClick={() => clickedTab('refunds_tab')}>Back to refunds</OrderBack>
    <div className="account-order-overview"><div><p className="account-order-reference">Refund #{clickedRefund._id?.slice(-8).toUpperCase()}</p><p className="account-order-muted">Requested {orderDate(clickedRefund.applicationDate)}</p></div><OrderStatus status={clickedRefund.status || 'pending'} /></div>
    <div className="account-order-card"><OrderProductSummary item={clickedRefund.order} /></div>
    <div className="account-order-info-grid"><OrderInfo title="Reason for return"><h4>{clickedRefund.selectedReason || 'No reason selected'}</h4><p>{clickedRefund.providedReason || 'No additional details provided.'}</p></OrderInfo><OrderInfo title="Refund progress">{clickedRefund.messages?.length ? <ol className="account-refund-messages">{clickedRefund.messages.map((item, index) => <li key={index}>{item.message}</li>)}</ol> : <p>Updates will appear here once your request is reviewed.</p>}</OrderInfo></div>
    <OrderInfo title="Attached photos">{clickedRefund.images?.length ? <div className="account-refund-photos">{clickedRefund.images.map((item, index) => <a key={index} href={item.url} target="_blank" rel="noreferrer"><img src={item.url} alt={'Refund photo ' + (index + 1)} /></a>)}</div> : <p>No photos attached.</p>}</OrderInfo>
  </div>;
}
