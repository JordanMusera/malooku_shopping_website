'use client';
import React, { useEffect, useRef, useState } from 'react';
import { OrderBack, orderDate } from './AccountOrderUI';
import { ReviewProduct, ReviewProductSummary, ReviewStars } from './AccountReviewUI';
interface Review { _id: string; rating: number; comment: string; date?: string; images?: { imageUrl: string }[]; }
export default function ViewReviewContainer({ productId, product, clickedTab }: { productId: string; product?: ReviewProduct; clickedTab: (tab: string) => void }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const saving = useRef(false);
  useEffect(() => {
    const controller = new AbortController(); setLoading(true); setLoadError(false);
    (async () => { try {
      const res = await fetch('/api/review/comment/user/' + productId, { cache: 'no-store', signal: controller.signal });
      const response = await res.json(); if (!res.ok || !response.success || !Array.isArray(response.content)) throw new Error();
      setReviews(response.content);
    } catch { if (!controller.signal.aborted) setLoadError(true); } finally { if (!controller.signal.aborted) setLoading(false); } })();
    return () => controller.abort();
  }, [productId, attempt]);
  const remove = async (id: string) => {
    if (saving.current) return; saving.current = true; setBusy(true); setError('');
    try {
      const res = await fetch('/api/review/comment/user/' + productId + '/' + id, { method: 'DELETE' });
      const response = await res.json(); if (!res.ok || !response.success || !Array.isArray(response.content)) throw new Error(response.message || 'Unable to delete your review. Please try again.');
      setReviews(response.content); setConfirmId(null); setDeleted(true);
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to delete your review. Please try again.'); }
    finally { saving.current = false; setBusy(false); }
  };
  return <div className="account-review-view"><OrderBack onClick={() => clickedTab('reviewed_tab')}>Back to reviewed products</OrderBack>
    {product && <div className="account-order-card"><ReviewProductSummary product={product} /></div>}
    {loading ? <p className="account-loading" role="status">Loading your review…</p> : loadError ? <div className="account-empty" role="alert"><h3>Unable to load your review.</h3><button className="account-order-button" onClick={() => setAttempt(n => n + 1)}>Try again</button></div> : !reviews.length ? <div className="account-empty" role="status"><h3>{deleted ? 'Your review has been deleted.' : 'No review to show.'}</h3><p>You can share your experience again at any time.</p><button className="account-order-button" onClick={() => clickedTab('review_tab')}>Write a review</button></div> : <div className="account-order-list">{reviews.map(item => <article className="account-order-card" key={item._id}><div className="account-review-meta"><ReviewStars rating={item.rating} />{item.date && <time dateTime={item.date}>{orderDate(item.date)}</time>}</div><p className="account-review-comment">{item.comment}</p>
      {!!item.images?.length && <div className="account-refund-photos">{item.images.map((image, index) => <a key={index} href={image.imageUrl} target="_blank" rel="noreferrer"><img src={image.imageUrl} alt={'Your review photo ' + (index + 1)} /></a>)}</div>}
      {confirmId === item._id ? <div className="account-review-confirm"><p>Delete this review?</p><div className="account-line-actions"><button className="account-order-button" disabled={busy} onClick={() => { setConfirmId(null); setError(''); }}>Keep review</button><button className="account-order-button account-review-delete" disabled={busy} onClick={() => remove(item._id)}>{busy ? 'Deleting…' : 'Confirm delete'}</button></div></div> : <div className="account-line-actions"><button className="account-order-button account-review-delete" disabled={busy} onClick={() => { setConfirmId(item._id); setError(''); }}>Delete review</button></div>}
    </article>)}</div>}
    {error && <p className="account-form-error" role="alert">{error}</p>}
  </div>;
}
