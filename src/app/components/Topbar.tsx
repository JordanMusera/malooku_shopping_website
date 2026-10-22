'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { addItem, deleteItem, minusItem, setCart, hydrateCart, waitForCartWrites } from '@/store/cartSlice';
import { RootState } from '@/store/store';
import { FiSearch, FiShoppingBag, FiUser, FiX, FiMinus, FiPlus, FiTrash2 } from 'react-icons/fi';

interface SearchProduct { _id: string; title: string; price: number; images?: { imageUrl: string }[] }
export default function Topbar() {
  const dispatch = useDispatch();
  const store = useStore<RootState>();
  const { cartItems, totalAmount } = useSelector((state: RootState) => state.cart);
  const itemCount = cartItems.reduce((total,item)=>total+item.orderedQty,0);
  useEffect(()=>{const controller=new AbortController();const expectedRevision=store.getState().cart.revision;fetch("/api/cart/user",{cache:"no-store",signal:controller.signal}).then(async res=>{if(res.status===401)return {cartData:[]};if(!res.ok)throw Error();return res.json();}).then(data=>{if(Array.isArray(data.cartData))dispatch(hydrateCart({...data,expectedRevision}));}).catch(()=>{});return ()=>controller.abort();},[dispatch,store]);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchProduct[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartMessage, setCartMessage] = useState('');
  const [cartStatus, setCartStatus] = useState<'loading' | 'ready' | 'unauthorized' | 'error'>('loading');
  const searchRef = useRef<HTMLFormElement>(null);
  const cartRef = useRef<HTMLElement>(null);
  const cartTrigger = useRef<HTMLButtonElement>(null);
  const closeCart = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const controller = new AbortController();
    if (!query.trim()) { setResults([]); setSearching(false); return; }
    setSearching(true);
    setSearchError(false);
    const timer = setTimeout(() => {
      fetch(`/api/products/search/${encodeURIComponent(query.trim())}`, { signal: controller.signal })
        .then(res => { if (!res.ok) throw new Error(); return res.json(); })
        .then(setResults)
        .catch(error => { if (error.name !== 'AbortError') { setSearchError(true); setResults([]); } })
        .finally(() => { if (!controller.signal.aborted) setSearching(false); });
    }, 250);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [query]);
  useEffect(() => {
    function dismiss(event: MouseEvent) { if (!searchRef.current?.contains(event.target as Node)) setSearchOpen(false); }
    document.addEventListener('mousedown', dismiss);
    return () => document.removeEventListener('mousedown', dismiss);
  }, []);
  useEffect(() => {
    if (!cartOpen) return;
    closeCart.current?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    function keyboard(event: KeyboardEvent) {
      if (event.key === 'Escape') setCartOpen(false);
      if (event.key === 'Tab') {
        const elements = cartRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled), a[href]');
        if (!elements?.length) return;
        const first = elements[0], last = elements[elements.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    }
    document.addEventListener('keydown', keyboard);
    return () => { document.body.style.overflow = overflow; document.removeEventListener('keydown', keyboard); cartTrigger.current?.focus(); };
  }, [cartOpen]);
  async function openCart() {
    setCartOpen(true);
    setCartStatus('loading');
    setCartMessage('Loading your bag...');
    try {
      await waitForCartWrites();
      const response = await fetch('/api/cart/user', { cache: 'no-store', credentials: 'same-origin' });
      if (response.status === 401) {
        dispatch(setCart({ cartData: [], totalCartCost: 0 }));
        setCartStatus('unauthorized');
        setCartMessage('Sign in to view your saved bag.');
        return;
      }
      if (!response.ok) throw new Error();
      const data = await response.json();
      if (!Array.isArray(data.cartData)) throw new Error();
      dispatch(setCart(data));
      setCartStatus('ready');
      setCartMessage('Your bag is empty. Explore the collection to add your first item.');
    } catch {
      setCartStatus('error');
      setCartMessage('Unable to load your bag. Please try again.');
    }
  }
  return (
    <header className="shop-nav">
      <Link href="/" className="brand" aria-label="Malooku home">MALOOKU<span>®</span></Link>
      <nav className="main-links" aria-label="Main navigation"><Link href="/#collection">The collection</Link><Link href="/#contact">Contact</Link></nav>
      <form ref={searchRef} role="search" className="shop-search" onSubmit={e => { e.preventDefault(); setSearchOpen(true); }} onKeyDown={e => { if (e.key === 'Escape') setSearchOpen(false); }}>
        <FiSearch aria-hidden="true" /><input aria-label="Search products" placeholder="Search the collection…" value={query} onFocus={() => setSearchOpen(true)} onChange={e => { setQuery(e.target.value); setSearchOpen(true); }} />
        {query && <button type="button" aria-label="Clear search" onClick={() => { setQuery(''); setSearchOpen(false); }}><FiX /></button>}
        {searchOpen && query.trim() && <div className="search-results" aria-live="polite">{searching ? <p>Looking for your next find…</p> : searchError ? <p>Search is unavailable. Please try again.</p> : results.length === 0 ? <p>No finds for “{query}”. Try another search.</p> : results.map(item => <Link href={`/viewProduct/${item._id}`} key={item._id} onClick={() => { setQuery(''); setSearchOpen(false); }}><img src={item.images?.[0]?.imageUrl || '/shopping_girl.png'} alt="" /><span>{item.title}<small>KSh {item.price.toLocaleString('en-KE')}</small></span></Link>)}</div>}
      </form>
      <div className="nav-actions"><Link href="/account" className="nav-icon" aria-label="My account"><FiUser /></Link><button ref={cartTrigger} type="button" className="nav-bag" onClick={openCart} aria-label={`Shopping bag, ${itemCount} items`} aria-expanded={cartOpen}><FiShoppingBag /><span className="bag-label">Bag</span><span className="bag-count" aria-live="polite" aria-atomic="true">{itemCount}</span></button></div>
      {cartOpen && <div className="cart-overlay" onClick={() => setCartOpen(false)}><aside ref={cartRef} role="dialog" aria-modal="true" aria-labelledby="bag-title" className="cart-drawer" onClick={e => e.stopPropagation()}><div className="cart-heading"><h2 id="bag-title">Your bag<span> ({itemCount})</span></h2><button ref={closeCart} className="nav-icon" aria-label="Close bag" onClick={() => setCartOpen(false)}><FiX /></button></div>{cartStatus !== 'ready' || cartItems.length === 0 ? <div className="bag-empty"><FiShoppingBag /><h3>{cartStatus === 'loading' ? 'Loading your bag' : cartStatus === 'unauthorized' ? 'Your shopping bag' : cartStatus === 'error' ? 'Something went wrong' : 'Your bag is empty'}</h3><p role="status">{cartMessage}</p>{cartStatus === 'unauthorized' && <Link href="/login" className="shop-button" onClick={() => setCartOpen(false)}>Sign in</Link>}{cartStatus === 'error' && <button className="shop-button" onClick={openCart}>Try again</button>}<button className="text-link" onClick={() => setCartOpen(false)}>Keep exploring ↗</button></div> : <><div className="cart-lines">{cartItems.map(item => <div className="cart-line" key={item._id}><img src={item.images?.[0]?.imageUrl || item.image} alt={item.title} /><div><Link href={`/viewProduct/${item._id}`} onClick={() => setCartOpen(false)}>{item.title}</Link><p>KSh {item.productQtyPrice.toLocaleString('en-KE')}</p><div className="cart-quantity"><button aria-label={`Decrease ${item.title} quantity`} disabled={item.orderedQty <= 1} onClick={() => dispatch(minusItem(item))}><FiMinus /></button><span>{item.orderedQty}</span><button aria-label={`Increase ${item.title} quantity`} onClick={() => dispatch(addItem(item))}><FiPlus /></button></div></div><button className="remove-item" aria-label={`Remove ${item.title}`} onClick={() => dispatch(deleteItem(item))}><FiTrash2 /></button></div>)}</div><div className="cart-total"><p><span>Subtotal</span><strong>KSh {totalAmount.toLocaleString('en-KE')}</strong></p><Link className="shop-button" href="/placeOrder" onClick={() => setCartOpen(false)}>Continue to checkout ↗</Link></div></>}</aside></div>}
    </header>
  );
}