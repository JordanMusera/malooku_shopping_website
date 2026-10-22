import { FiArrowRight } from 'react-icons/fi';
export default function HomeTopBar() {
  return (
    <section className="shop-hero">
      <div className="hero-copy">
        <span className="eyebrow">MALOOKU / THE EVERYDAY EDIT</span>
        <h1>Objects for<br />everyday living.</h1>
        <p>Simple pieces. Lasting appeal.<br />Discover essentials for your own kind of everyday.</p>
        <a href="#collection" className="shop-button">Explore the collection <FiArrowRight aria-hidden="true" /></a>
      </div>
      <div className="hero-art"><img src="/sample-products/wireless-headphones.jpg" alt="Minimal over-ear headphones" fetchPriority="high" /><span className="hero-image-label">01 / SOUND &amp; STYLE</span></div>
    </section>
  );
}