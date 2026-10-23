import Link from 'next/link';
import { FiArrowLeft, FiArrowUpRight } from 'react-icons/fi';
import type { ReactNode } from 'react';
export default function AuthLayout({ children }: { children: ReactNode }) {
  return <div className="auth-page"><header className="auth-header"><Link className="brand" href="/" aria-label="Malooku home">MALOOKU<span>®</span></Link><Link href="/#collection" className="auth-back"><FiArrowLeft aria-hidden="true" />Back to the collection</Link></header>
    <main className="auth-layout"><aside className="auth-story" aria-label="Welcome to Malooku"><p className="auth-eyebrow">EVERYDAY, CONSIDERED</p><h2>Good things.<br />Simply yours.</h2><p>A little style. A little comfort.<br />Find the things that fit your everyday.</p><div className="auth-editorial-images" aria-hidden="true"><img src="/sample-products/everyday-wristwatch.jpg" alt="" /><img src="/sample-products/ceramic-coffee-mug.jpg" alt="" /></div><Link href="/#collection">Explore the collection <FiArrowUpRight aria-hidden="true" /></Link></aside><section className="auth-panel" aria-labelledby="auth-title">{children}</section></main>
    <footer className="auth-footer"><span>© {new Date().getFullYear()} Malooku</span><Link href="/#contact">Need a hand? Contact us</Link></footer>
  </div>;
}
