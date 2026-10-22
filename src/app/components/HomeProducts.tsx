'use client';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { FiArrowUpRight, FiGrid } from 'react-icons/fi';

interface Product {
  _id: string;
  title: string;
  price: number;
  category: string;
  images?: { imageUrl: string }[];
  image?: string;
}

export default function HomeProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [category, setCategory] = useState('All products');
  const [sort, setSort] = useState('featured');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(false);
    fetch('/api/products', { cache: 'no-store', signal: controller.signal })
      .then(res => { if (!res.ok) throw new Error(); return res.json(); })
      .then(setProducts)
      .catch(error => { if (error.name !== 'AbortError') setError(true); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [attempt]);
  const categories = ['All products', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];
  const visible = useMemo(() => {
    const items = products.filter(p => category === 'All products' || p.category === category);
    if (sort === 'price-low') items.sort((a, b) => a.price - b.price);
    if (sort === 'price-high') items.sort((a, b) => b.price - a.price);
    if (sort === 'name') items.sort((a, b) => a.title.localeCompare(b.title));
    return items;
  }, [products, category, sort]);
  return (
    <section id="collection" className="collection-section">
      <div className="collection-heading"><div><span className="eyebrow">THE COLLECTION</span><h2>Everyday essentials</h2></div><p>Designed to fit into your day.</p></div>
      <div className="collection-controls">
        <div className="category-tabs" aria-label="Product categories">{categories.map(item => <button key={item} onClick={() => setCategory(item)} aria-pressed={category === item} className={category === item ? 'active' : ''}>{item === 'All products' && <FiGrid aria-hidden="true" />}{item}</button>)}</div>
        <label className="sort-control">Sort by <select value={sort} onChange={e => setSort(e.target.value)}><option value="featured">Featured</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="name">Name: A–Z</option></select></label>
      </div>
      {!loading && !error && <p className="product-count">{visible.length} {visible.length === 1 ? 'product' : 'products'}</p>}
      {loading ? <div className="product-grid" role="status" aria-label="Loading products">{Array.from({ length: 6 }, (_, i) => <div className="product-skeleton" key={i}><div /><span /></div>)}</div> : error ? <div className="shop-empty" role="alert"><h3>We couldn’t load your finds.</h3><p>Please give it another try.</p><button className="shop-button" onClick={() => setAttempt(n => n + 1)}>Try again</button></div> : visible.length === 0 ? <div className="shop-empty"><h3>More good things are on the way.</h3><p>No products in this collection yet.</p></div> : <div className="product-grid">{visible.map(product => <Link key={product._id} href={`/viewProduct/${product._id}`} className={`product-card ${product.image?.includes("backpack") || product.image?.includes("wristwatch") ? "product-cutout" : ""}`}><div className="product-visual"><img src={product.images?.[0]?.imageUrl || product.image || '/shopping_girl.png'} alt={product.title} loading="lazy" /></div><div className="product-info"><p>{product.category}</p><h3>{product.title}</h3><span className="product-price"><small>KSh</small> {product.price.toLocaleString('en-KE')}</span></div></Link>)}</div>}
    </section>
  );
}