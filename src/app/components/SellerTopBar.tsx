import Link from 'next/link';
import { FiArrowUpRight } from 'react-icons/fi';
export default function SellerTopBar() {
 return <header className="admin-topbar"><span className="admin-topbar-title">Malooku <span>/</span> Administration</span><Link href="/">View store <FiArrowUpRight aria-hidden="true"/></Link></header>;
}
