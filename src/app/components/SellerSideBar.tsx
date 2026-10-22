import Link from 'next/link';
import { FiGrid, FiShoppingBag, FiBox, FiUsers, FiCreditCard, FiArrowUpRight } from 'react-icons/fi';
export const adminSections = [
 {id:'dashboard',label:'Overview',description:'A clear view of your store, all in one place.',icon:FiGrid},
 {id:'ordersTab',label:'Orders',description:'Follow every order from checkout to delivery.',icon:FiShoppingBag},
 {id:'productsTab',label:'Products',description:'Manage your collection, pricing, and stock.',icon:FiBox},
 {id:'usersTab',label:'Customers',description:'Your customer directory and contact details.',icon:FiUsers},
 {id:'paymentTab',label:'Payments',description:'Payment information for your store.',icon:FiCreditCard},
];
export default function SellerSideBar({activeTab,onNavigate}:{activeTab:string,onNavigate:(id:string)=>void}) {
 return <aside className="admin-sidebar"><Link href="/" className="admin-brand">MALOOKU<span>ADMIN WORKSPACE</span></Link><p className="admin-nav-caption">MANAGE STORE</p><nav aria-label="Admin navigation">{adminSections.map(({id,label,icon:Icon})=><button key={id} aria-current={activeTab===id?'page':undefined} onClick={()=>onNavigate(id)}><Icon aria-hidden="true"/>{label}</button>)}</nav><div className="admin-sidebar-footer"><span>Your store, thoughtfully managed.</span><Link href="/">View storefront <FiArrowUpRight/></Link></div></aside>;
}
