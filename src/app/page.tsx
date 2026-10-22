import HomeProducts from './components/HomeProducts';
import HomeTopBar from './components/HomeTopBar';
import Topbar from './components/Topbar';
import Footer from './components/Footer';
export default function Home() {
  return (
    <div className="storefront">
      <div className="store-header"><Topbar /></div>
      <main className="shop-container"><HomeTopBar /><HomeProducts /></main>
      <Footer />
    </div>
  );
}