'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { FaStar } from 'react-icons/fa';
import { FiChevronDown, FiChevronUp, FiMessageCircle, FiSend } from 'react-icons/fi';

interface ReviewImage { imageUrl: string; }
interface Reply { _id: string; userName?: string; reply: string; date?: string; }
interface ProductReview { _id: string; userName?: string; comment: string; rating: number; images?: ReviewImage[]; replies?: Reply[]; date?: string; }

export default function CustomerReviewsContainer({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openReplies, setOpenReplies] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyError, setReplyError] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const loadReviews = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/review/comment/${encodeURIComponent(productId)}`, { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || 'Reviews could not be loaded.');
      setReviews(Array.isArray(data.content?.productReviews) ? data.content.productReviews : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Reviews could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => { void loadReviews(); }, [loadReviews]);

  const average = useMemo(() => reviews.length ? reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length : 0, [reviews]);
  const distribution = useMemo(() => [5, 4, 3, 2, 1].map(stars => ({ stars, count: reviews.filter(review => Math.round(Number(review.rating || 0)) === stars).length })), [reviews]);

  const submitReply = async (reviewId: string) => {
    if (!replyText.trim() || replyingTo) return;
    setReplyingTo(reviewId);
    setReplyError('');
    try {
      const response = await fetch('/api/review/reply', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, reviewId, reply: replyText.trim() }),
      });
      const data = await response.json();
      if (data.redirect) { window.location.assign(data.url); return; }
      if (!response.ok || !data.success) throw new Error(data.message || 'Your reply could not be posted.');
      setReviews(Array.isArray(data.content?.comments) ? data.content.comments : reviews);
      setReplyText('');
    } catch (e) {
      setReplyError(e instanceof Error ? e.message : 'Your reply could not be posted.');
    } finally {
      setReplyingTo(null);
    }
  };

  return <section className="product-reviews" aria-labelledby="product-reviews-title">
    <div className="product-reviews-heading">
      <div><p className="product-reviews-eyebrow">FROM OUR CUSTOMERS</p><h2 id="product-reviews-title">Customer reviews</h2><p>Thoughts and experiences shared by Malooku customers.</p></div>
      {!loading && !error && <span className="product-reviews-count">{reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</span>}
    </div>
    {loading ? <p className="product-reviews-state" role="status">Loading customer reviews…</p> : error ? <div className="product-reviews-state" role="alert"><p>{error}</p><button type="button" onClick={() => void loadReviews()}>Try again</button></div> : reviews.length === 0 ? <div className="product-reviews-empty"><FiMessageCircle aria-hidden="true" /><h3>No reviews yet</h3><p>Be the first to share your experience with this product.</p></div> : <>
      <div className="product-reviews-summary">
        <div className="product-reviews-average"><strong>{average.toFixed(1)}</strong><div><span className="product-review-stars" aria-label={`${average.toFixed(1)} out of 5 stars`}>{[1, 2, 3, 4, 5].map(star => <FaStar key={star} aria-hidden="true" className={star <= Math.round(average) ? 'is-filled' : ''} />)}</span><span>Based on {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</span></div></div>
        <div className="product-reviews-breakdown" aria-label="Ratings breakdown">{distribution.map(row => <div className="product-review-breakdown-row" key={row.stars}><span>{row.stars} stars</span><span className="product-review-meter"><span style={{ width: `${reviews.length ? row.count / reviews.length * 100 : 0}%` }} /></span><span>{row.count}</span></div>)}</div>
      </div>
      <div className="product-review-list">{reviews.map((review, index) => {
        const reviewer = review.userName?.trim() || 'Malooku customer';
        const replies = Array.isArray(review.replies) ? review.replies : [];
        const date = review.date && !Number.isNaN(new Date(review.date).getTime()) ? new Date(review.date).toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' }) : '';
        const expanded = openReplies === review._id;
        return <article className="product-review-card" key={review._id || `${reviewer}-${index}`}>
          <header className="product-review-card-heading"><span className="product-review-avatar" aria-hidden="true">{reviewer.charAt(0).toUpperCase()}</span><div className="product-review-author"><strong>{reviewer}</strong>{date && <time dateTime={new Date(review.date as string).toISOString()}>{date}</time>}</div><span className="product-review-stars" aria-label={`${review.rating} out of 5 stars`}>{[1, 2, 3, 4, 5].map(star => <FaStar key={star} aria-hidden="true" className={star <= Number(review.rating) ? 'is-filled' : ''} />)}</span></header>
          <p className="product-review-comment">{review.comment}</p>
          {!!review.images?.length && <div className="product-review-photos">{review.images.map((image, photoIndex) => <a href={image.imageUrl} target="_blank" rel="noreferrer" key={`${image.imageUrl}-${photoIndex}`} aria-label={`Open customer photo ${photoIndex + 1}`}><img src={image.imageUrl} alt={`Photo shared by ${reviewer}`} loading="lazy" /></a>)}</div>}
          {!!replies.length && <button className="product-review-replies-toggle" type="button" aria-expanded={expanded} onClick={() => setOpenReplies(expanded ? null : review._id)}>{expanded ? <FiChevronUp /> : <FiChevronDown />} {expanded ? 'Hide' : 'View'} {replies.length} {replies.length === 1 ? 'reply' : 'replies'}</button>}
          {expanded && <div className="product-review-replies">{replies.map((reply, replyIndex) => <div className="product-review-reply" key={reply._id || replyIndex}><strong>{reply.userName || 'Customer'}</strong><p>{reply.reply}</p></div>)}<label className="product-review-reply-label" htmlFor={`review-reply-${review._id}`}>Add a reply</label><div className="product-review-reply-form"><input id={`review-reply-${review._id}`} value={replyText} maxLength={500} onChange={e => setReplyText(e.target.value)} placeholder="Write a reply" /><button type="button" aria-label="Send reply" disabled={!replyText.trim() || replyingTo === review._id} onClick={() => void submitReply(review._id)}><FiSend />{replyingTo === review._id ? 'Sending…' : 'Send'}</button></div>{replyError && <p className="product-review-reply-error" role="alert">{replyError}</p>}</div>}
          {!replies.length && <button className="product-review-replies-toggle" type="button" aria-expanded={expanded} onClick={() => { setOpenReplies(expanded ? null : review._id); setReplyError(''); }}>{expanded ? <FiChevronUp /> : <FiMessageCircle />} {expanded ? 'Close discussion' : 'Join the discussion'}</button>}
          {expanded && !replies.length && <div className="product-review-replies"><label className="product-review-reply-label" htmlFor={`review-reply-${review._id}`}>Add a reply</label><div className="product-review-reply-form"><input id={`review-reply-${review._id}`} value={replyText} maxLength={500} onChange={e => setReplyText(e.target.value)} placeholder="Write a reply" /><button type="button" aria-label="Send reply" disabled={!replyText.trim() || replyingTo === review._id} onClick={() => void submitReply(review._id)}><FiSend />{replyingTo === review._id ? 'Sending…' : 'Send'}</button></div>{replyError && <p className="product-review-reply-error" role="alert">{replyError}</p>}</div>}
        </article>;
      })}</div>
    </>}
  </section>;
}
