'use client';
import React, { useEffect, useRef, useState } from 'react';
import { FiStar } from 'react-icons/fi';
import { OrderBack } from './AccountOrderUI';
import { ReviewProduct, ReviewProductSummary } from './AccountReviewUI';
export default function PostReviewContainer({ productId, product, clickedTab }: { productId: string; product?: ReviewProduct; clickedTab: (tab: string) => void }) {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const saving = useRef(false);
  useEffect(() => { const urls = files.map(file => URL.createObjectURL(file)); setPreviews(urls); return () => urls.forEach(url => URL.revokeObjectURL(url)); }, [files]);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); if (saving.current) return;
    if (!productId || !rating || !review.trim()) { setError('Choose a star rating and write a short review.'); return; }
    saving.current = true; setBusy(true); setError('');
    const data = new FormData(); data.append('rating', String(rating)); data.append('review', review.trim()); data.append('productId', productId); files.forEach(file => data.append('images', file));
    try {
      const res = await fetch('/api/review/comment/user', { method: 'POST', body: data });
      const response = await res.json(); if (!res.ok || !response.success) throw new Error(response.message || 'Unable to submit your review. Please try again.');
      clickedTab('reviewed_tab');
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to submit your review. Please try again.'); }
    finally { saving.current = false; setBusy(false); }
  };
  return <div className="account-review-view"><OrderBack onClick={() => clickedTab('pending_review_tab')}>Back to pending reviews</OrderBack>
    {product && <div className="account-order-card"><ReviewProductSummary product={product} /></div>}
    <p className="account-order-muted">Your experience helps other shoppers find the right product.</p>
    <form className="account-review-form" onSubmit={submit}><fieldset disabled={busy} className="account-review-fields"><fieldset className="account-review-rating"><legend>How would you rate this product?</legend><div className="account-review-rating-options">{[1,2,3,4,5].map(star => <label className="account-review-star" key={star}><input type="radio" name="review-rating" value={star} checked={rating === star} onChange={() => setRating(star)} required /><span aria-hidden="true"><FiStar fill={star <= rating ? 'currentColor' : 'none'} /></span><span className="sr-only">{star} {star === 1 ? 'star' : 'stars'}</span></label>)}</div><output aria-live="polite">{rating ? rating + ' out of 5' : 'Select a star rating'}</output></fieldset>
      <div className="account-field"><label htmlFor="review-comment">Your review</label><textarea id="review-comment" value={review} onChange={e => setReview(e.target.value)} required maxLength={2000} rows={5} placeholder="What did you like? What could be better?" /><p className="account-order-muted">{review.length}/2000 characters</p></div>
      <div className="account-field"><label htmlFor="review-photos">Add photos <span>(optional)</span></label><input id="review-photos" type="file" accept="image/*" multiple onChange={e => setFiles(previous => [...previous, ...Array.from(e.target.files || [])])} /><p className="account-order-muted">Show other shoppers the details that matter to you.</p></div>
      {!!previews.length && <div className="account-refund-photos">{previews.map((src, index) => <div key={src}><img src={src} alt={'Selected review photo ' + (index + 1)} /><button type="button" className="account-order-button" onClick={() => setFiles(previous => previous.filter((_, i) => i !== index))}>Remove photo {index + 1}</button></div>)}</div>}
      <div className="account-line-actions"><button type="submit" className="account-order-button account-order-button-primary">{busy ? 'Submitting…' : 'Submit review'}</button></div>
    </fieldset>{error && <p className="account-form-error" role="alert">{error}</p>}</form>
  </div>;
}
