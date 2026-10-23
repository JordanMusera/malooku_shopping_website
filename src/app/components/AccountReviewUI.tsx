'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiMessageSquare, FiPackage, FiStar } from 'react-icons/fi';
import { money } from './AccountOrderUI';
export interface ReviewProduct { _id: string; title: string; price: number; image?: string; images?: { imageUrl: string }[]; }
export interface ReviewNavigation { clickedTab: (tab: string) => void; productId: (id: string, product?: ReviewProduct) => void; }
export function ReviewProductSummary({ product }: { product?: ReviewProduct }) {
  if (!product) return null;
  const image = product.images?.[0]?.imageUrl || product.image;
  return <div className="account-line-item"><div className="account-line-image">{image ? <img src={image} alt={product.title} /> : <FiPackage aria-hidden="true" />}</div><div className="account-line-copy"><h3>{product.title}</h3><p>{money(product.price)}</p></div></div>;
}
export function ReviewStars({ rating }: { rating: number }) {
  return <div className="account-review-stars" role="img" aria-label={rating + ' out of 5 stars'}>{[1,2,3,4,5].map(star => <FiStar key={star} aria-hidden="true" fill={star <= rating ? 'currentColor' : 'none'} />)}</div>;
}
interface Purchase { _id: string; productId: string; product: ReviewProduct; reviewed: boolean; }
export function AccountReviewList({ reviewed, clickedTab, productId }: ReviewNavigation & { reviewed: boolean }) {
  const [items, setItems] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController(); setLoading(true); setError(false);
    (async () => { try {
      const res = await fetch('/api/orders/purchasedOrders', { cache: 'no-store', signal: controller.signal });
      if (!res.ok) throw new Error();
      const response = await res.json();
      if (!Array.isArray(response.content) && response.message !== 'No items found') throw new Error();
      setItems((response.content || []).filter((item: Purchase) => item.reviewed === reviewed));
    } catch { if (!controller.signal.aborted) setError(true); } finally { if (!controller.signal.aborted) setLoading(false); } })();
    return () => controller.abort();
  }, [reviewed, attempt]);
  return <div className="account-reviews">{loading ? <p className="account-loading" role="status">Loading your reviews…</p> : error ? <div className="account-empty" role="alert"><h3>Unable to load your reviews.</h3><p>Please give it another try.</p><button className="account-order-button" onClick={() => setAttempt(n => n + 1)}>Try again</button></div> : !items.length ? <div className="account-empty"><FiMessageSquare /><h3>{reviewed ? 'No reviews yet.' : 'You’re all caught up.'}</h3><p>{reviewed ? 'Reviews you submit will appear here.' : 'Products awaiting your review will appear here after purchase.'}</p><Link className="account-order-button" href="/#collection">Explore the collection</Link></div> : <>
    <p className="account-order-muted account-review-intro">{reviewed ? 'Revisit the experiences you’ve shared.' : 'Share your experience with your purchases.'}</p><div className="account-order-list">{items.map((item, index) => <article key={item._id || item.productId + index} className="account-order-card account-review-card"><ReviewProductSummary product={item.product} /><div className="account-review-card-actions"><span className="account-order-muted">{reviewed ? 'Review submitted' : 'Awaiting your review'}</span><button className="account-order-button" onClick={() => { productId(item.productId, item.product); clickedTab(reviewed ? 'view_review_tab' : 'review_tab'); }}>{reviewed ? 'View review' : 'Write review'}</button></div></article>)}</div>
  </>}</div>;
}
