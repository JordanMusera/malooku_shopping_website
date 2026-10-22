'use client';
import { FiUser, FiShoppingBag, FiHeart, FiMessageSquare, FiBell, FiLock, FiArrowUpRight } from 'react-icons/fi';
import Link from 'next/link';
const sections = [
  { id: 'edit_profile', label: 'Personal information', icon: FiUser, tabs: ['edit_profile'] },
  { id: 'ordersTab', label: 'My orders', icon: FiShoppingBag, tabs: ['ordersTab','viewOrderTab','trackorder','cancelled_orders_tab','refunds_tab','refund_form_tab','view_order_application'] },
  { id: 'favouriteTab', label: 'Saved items', icon: FiHeart, tabs: ['favouriteTab'] },
  { id: 'pending_review_tab', label: 'Reviews', icon: FiMessageSquare, tabs: ['pending_review_tab','reviewed_tab','review_tab','view_review_tab'] },
  { id: 'notifications_tab', label: 'Notifications', icon: FiBell, tabs: ['notifications_tab'] },
  { id: 'security', label: 'Security', icon: FiLock, tabs: ['security'] },
];
export default function AccountMenu({ clikedTab, activeTab }: { clikedTab: (tab: string) => void; activeTab: string }) {
  const current = sections.find(section => section.tabs.includes(activeTab))?.id || 'edit_profile';
  return <><div className="account-mobile-menu"><label htmlFor="account-section-select">Account section</label><select id="account-section-select" value={current} onChange={event => clikedTab(event.target.value)}>{sections.map(section => <option key={section.id} value={section.id}>{section.label}</option>)}</select></div><nav className="account-menu" aria-label="Account sections">{sections.map(({id,label,icon:Icon,tabs}) => <button key={id} onClick={() => clikedTab(id)} aria-current={tabs.includes(activeTab) ? 'page' : undefined}><Icon aria-hidden="true" /><span>{label}</span><span className="account-menu-arrow" aria-hidden="true">&rarr;</span></button>)}</nav><div className="account-help"><span className="eyebrow">HERE TO HELP</span><p>Need a hand with your order?</p><Link href="/#contact">Contact us <FiArrowUpRight aria-hidden="true" /></Link></div></>;
}