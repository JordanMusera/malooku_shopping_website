import Link from 'next/link';
import { FiLock, FiArrowUpRight } from 'react-icons/fi';
export default function AccountSecurityContainer() {
  return <div className="account-security"><div className="account-feature-icon"><FiLock /></div><h3>Password &amp; access</h3><p>Keep your account protected with a unique password. Use the password reset process to choose a new one.</p><div className="security-setting"><div><h4>Password</h4><span>Reset your password using your account email.</span></div><Link href="/resetPassword" className="shop-button">Change password <FiArrowUpRight /></Link></div></div>;
}