"use client";
import { useState } from 'react';
import { ConfigProvider } from 'antd';
import SellerSideBar, { adminSections } from '../components/SellerSideBar';
import SellerTopBar from '../components/SellerTopBar';
import SellerDashboard from '../components/SellerDashboard';
import SellerOrders from '../components/SellerOrders';
import SellerProductsContainer from '../components/SellerProductsContainer';
import SellerUsersContainer from '../components/SellerUsersContainer';
import SellerPaymentsContainer from '../components/SellerPaymentsContainer';
import './admin.css';
import AdminAccess from '../components/AdminAccess';

export default function AdminHome() {
 const [tab, setTab] = useState('dashboard');
 const section = adminSections.find(item=>item.id===tab)!;
 return <AdminAccess><ConfigProvider theme={{token:{colorPrimary:'#294c3b',borderRadius:8,fontFamily:'inherit',colorText:'#202923',colorBorderSecondary:'#e8ece8'},components:{Table:{headerBg:'#f7f8f6',headerColor:'#647067',cellPaddingBlock:18}}}}>
  <div className="admin-shell">
   <SellerSideBar activeTab={tab} onNavigate={setTab}/>
   <div className="admin-workspace">
    <SellerTopBar/>
    <main className="admin-main">
     <label className="admin-mobile-nav">Workspace<select aria-label="Admin section" value={tab} onChange={e=>setTab(e.target.value)}>{adminSections.map(item=><option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
     <header className="admin-page-heading"><div><p className="admin-eyebrow">STORE MANAGEMENT</p><h1>{section.label}</h1><p>{section.description}</p></div><span className="admin-store-label"><i/> Malooku store</span></header>
     {tab==='dashboard' && <SellerDashboard onNavigate={setTab}/>}
     {tab==='ordersTab' && <SellerOrders/>}
     {tab==='productsTab' && <SellerProductsContainer/>}
     {tab==='usersTab' && <SellerUsersContainer/>}
     {tab==='paymentTab' && <SellerPaymentsContainer/>}
    </main>
   </div>
  </div>
 </ConfigProvider></AdminAccess>;
}
