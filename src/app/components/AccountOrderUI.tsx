'use client';
import Link from 'next/link';
import { FiArrowLeft, FiPackage } from 'react-icons/fi';
import type { ReactNode } from 'react';

export interface AccountOrderProduct {
  product: { _id: string; title: string; price: number; image?: string; images?: { imageUrl: string }[] };
  quantity: number;
  productQtyPrice: number;
}
export const money = (value: number) => 'KSh ' + Number(value || 0).toLocaleString('en-KE');
export const orderDate = (value?: string) => {
  if (!value) return 'Date unavailable';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};
export function OrderBack({ onClick, children = 'Back to orders' }: { onClick: () => void; children?: ReactNode }) {
  return <button type="button" className="account-order-back" onClick={onClick}><FiArrowLeft aria-hidden="true" />{children}</button>;
}
export function OrderStatus({ status }: { status: string }) {
  return <span className="account-order-status">{status || 'Pending'}</span>;
}
export function OrderProductSummary({ item, children }: { item: AccountOrderProduct; children?: ReactNode }) {
  const image = item.product.images?.[0]?.imageUrl || item.product.image;
  return <div className="account-line-item">
    <div className="account-line-image">{image ? <img src={image} alt={item.product.title} /> : <FiPackage aria-hidden="true" />}</div>
    <div className="account-line-copy"><h3>{item.product.title}</h3><p>{money(item.product.price)} <span aria-hidden="true">·</span> Qty {item.quantity}</p><strong>{money(item.productQtyPrice)}</strong>{children}</div>
  </div>;
}
export function OrderInfo({ title, children }: { title: string; children: ReactNode }) {
  return <section className="account-order-info"><h3>{title}</h3>{children}</section>;
}
export function OrderUnavailable({ onBack }: { onBack: () => void }) {
  return <div className="account-empty"><FiPackage /><h3>Select an order first.</h3><p>Choose an order to see its details.</p><button className="shop-button" onClick={onBack}>Back to orders</button></div>;
}
export function OrderProductLink({ id }: { id: string }) {
  return <Link className="account-order-button" href={'/viewProduct/' + id}>View product</Link>;
}
