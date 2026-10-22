'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FiHeart } from 'react-icons/fi';
interface Product { _id: string; title: string; price: number; category: string; image?: string; images?: { imageUrl: string }[] }
export default function FavouriteContainer() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError(false);
    fetch('/api/wishlist', { signal: controller.signal, cache: 'no-store' })
      .then(async res => { if (!res.ok) throw new Error(); const data = await res.json(); if (!data.success && data.message !== 'Wishlist is empty') throw new Error(); return data.wishlist || []; })
      .then(setProducts)
      .catch(error => { if (error.name !== 'AbortError') setError(true); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [attempt]);
  if (loading) return <p className="account-loading" role="status">Loading your saved items...</p>;
  if (error) return <div className="account-empty" role="alert"><h3>Unable to load saved items.</h3><p>Please give it another try.</p><button className="shop-button" onClick={() => setAttempt(n => n + 1)}>Try again</button></div>;
  if (!products.length) return <div className="account-empty"><FiHeart /><h3>A place for your favourites.</h3><p>Tap the heart on a product to save it here for later.</p><Link className="shop-button" href="/#collection">Explore the collection</Link></div>;
  return <div className="account-saved-grid">{products.map(product => <Link key={product._id} href={`/viewProduct/${product._id}`} className="product-card"><div className="product-visual"><img src={product.images?.[0]?.imageUrl || product.image} alt={product.title} loading="lazy" /></div><div className="product-info"><p>{product.category}</p><h3>{product.title}</h3><span className="product-price"><small>KSh </small>{product.price.toLocaleString('en-KE')}</span></div></Link>)}</div>;
}