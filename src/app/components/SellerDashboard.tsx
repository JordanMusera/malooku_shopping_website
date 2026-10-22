"use client";
import { useEffect, useState } from 'react';
import { FiArrowRight, FiBox, FiShoppingBag, FiUsers, FiClock } from 'react-icons/fi';
export default function SellerDashboard({onNavigate}:{onNavigate:(id:string)=>void}) {
 const [data,setData]=useState<{orders:any[],products:any[],users:any[]} | null>(null);
 const [error,setError]=useState(false);
 const [attempt,setAttempt]=useState(0);
 useEffect(()=>{let active=true; setError(false); Promise.all(['orders','products','users'].map(async resource=>{const res=await fetch('/api/'+resource+'/controller'); const body=await res.json(); if(!res.ok || !body.success || !Array.isArray(body.content)) throw new Error('Unavailable'); return body.content;})).then(([orders,products,users])=>{if(active)setData({orders,products,users});}).catch(()=>{if(active)setError(true);}); return ()=>{active=false;};},[attempt]);
 if(error) return <div className="admin-empty" role="alert"><h2>Store overview unavailable</h2><p>We could not load your store data. Please try again.</p><button className="admin-primary" onClick={()=>setAttempt(v=>v+1)}>Try again</button></div>;
 if(!data) return <div className="admin-loading" role="status">Loading your store overview…</div>;
 const pending=data.orders.filter(o=>o.status==='pending').length;
 const recent=[...data.orders].sort((a,b)=>new Date(b.orderDate).getTime()-new Date(a.orderDate).getTime()).slice(0,5);
 const lowStock=data.products.filter(p=>Number(p.qty??p.stock??0)<=5);
 const stats=[{label:'Total orders',value:data.orders.length,icon:FiShoppingBag,target:'ordersTab',note:'Across your store'},{label:'Awaiting fulfilment',value:pending,icon:FiClock,target:'ordersTab',note:'Orders marked pending'},{label:'Products',value:data.products.length,icon:FiBox,target:'productsTab',note:'In your collection'},{label:'Customers',value:data.users.length,icon:FiUsers,target:'usersTab',note:'Registered accounts'}];
 return <>
  <section className="admin-stats" aria-label="Store summary">{stats.map(({label,value,icon:Icon,target,note})=><button key={label} className="admin-stat" onClick={()=>onNavigate(target)}><span>{label}<Icon/></span><strong>{value.toLocaleString()}</strong><small>{note}<FiArrowRight/></small></button>)}</section>
  <div className="admin-overview-grid">
   <section className="admin-card"><div className="admin-card-heading"><div><h2>Recent orders</h2><p>Your latest customer purchases</p></div><button className="admin-text-button" onClick={()=>onNavigate('ordersTab')}>View all <FiArrowRight/></button></div>{recent.length ? <div className="admin-table-scroll"><table className="admin-recent-table"><thead><tr><th>Order</th><th>Date</th><th>Status</th><th>Total</th></tr></thead><tbody>{recent.map(order=><tr key={order._id}><td>#{order._id.slice(-8).toUpperCase()}</td><td>{order.orderDate?new Date(order.orderDate).toLocaleDateString('en-GB',{day:'numeric',month:'short'}):'—'}</td><td><span className={'admin-status status-'+order.status}>{order.status}</span></td><td>KSh {Number(order.totalCost||0).toLocaleString()}</td></tr>)}</tbody></table></div>:<div className="admin-empty"><FiShoppingBag/><h3>Your next order starts here</h3><p>New customer orders will appear here as they arrive.</p><button className="admin-text-button" onClick={()=>onNavigate('productsTab')}>Manage products <FiArrowRight/></button></div>}</section>
   <section className="admin-card"><div className="admin-card-heading"><div><h2>Stock watch</h2><p>Products with 5 or fewer available</p></div><FiBox/></div>{lowStock.length?<ul className="admin-stock-list">{lowStock.slice(0,4).map(product=><li key={product._id}><img src={product.image} alt=""/><span>{product.title}<small>{Number(product.qty??product.stock??0)} remaining</small></span></li>)}</ul>:<div className="admin-empty"><FiBox/><h3>{data.products.length?'Stock looks healthy':'Build your collection'}</h3><p>{data.products.length?'No products are running low on stock.':'Add products to start building your store.'}</p></div>}<button className="admin-card-link" onClick={()=>onNavigate('productsTab')}>Manage inventory <FiArrowRight/></button></section>
  </div>
  <section className="admin-collection-callout"><div><span className="admin-eyebrow">YOUR COLLECTION</span><h2>Make room for the next favourite.</h2><p>Keep your products fresh, accurate, and ready to shop.</p></div><button className="admin-primary" onClick={()=>onNavigate('productsTab')}>Manage products <FiArrowRight/></button></section>
 </>;
}
