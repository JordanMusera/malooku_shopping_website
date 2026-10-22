import Link from 'next/link';
export default function Footer() {
  return (
    <footer className="shop-footer" id="contact"><div className="shop-container footer-grid"><div><Link className="brand" href="/">MALOOKU</Link><p>Essentials for home, work<br />and everyday life.</p><span className="footer-location">Vihiga, Kenya</span></div><div><h3>Explore</h3><Link href="/#collection">The collection</Link><Link href="/account">My account</Link><Link href="/login">Sign in</Link></div><div><h3>Contact</h3><a href="mailto:jordanmusera@gmail.com">jordanmusera@gmail.com</a><a href="tel:+254113197613">+254 113 197 613</a><p>Hamisi, Vihiga, Kenya</p></div></div><div className="shop-container footer-bottom"><span>&copy; {new Date().getFullYear()} Malooku</span><span>Thoughtfully selected. Simply yours.</span></div></footer>
  );
}