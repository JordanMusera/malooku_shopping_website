import Link from 'next/link';
import Footer from '../../components/Footer';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import mongoose from 'mongoose';
import ProductImageView from '../../components/ProductImageView';
import Topbar from '../../components/Topbar';
import ProductDetails from '../../components/ProductDetails';
import CustomerReviewsContainer from '../../components/CustomerReviewsContainer';
import dbConnect from '../../config/database';
import Product from '../../models/product';
import Wishlist from '../../models/wishlist';
import { verifyToken } from '../../api/authenticate/functions/auth';

export default async function ProductPage({ params }: { params: { id: string } }) {
  if (!mongoose.isValidObjectId(params.id)) notFound();

  await dbConnect();
  const document = await Product.findById(params.id);
  if (!document) notFound();

  const product = JSON.parse(JSON.stringify(document));
  const token = cookies().get('authToken')?.value;
  product.wish = false;
  if (token) {
    // An expired login should not prevent browsing public products.
    const auth = await verifyToken(token).catch(() => null);
    if (auth) {
      const wishlist = await Wishlist.findOne({ userId: auth.userId });
      product.wish = Boolean(wishlist?.wishlist.some(
        (entry: { productId: string }) => String(entry.productId) === product._id
      ));
    }
  }

  return (
    <div className="product-page">
      <div className="store-header"><Topbar /></div>
      <main className="shop-container">
        <nav className="product-breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/#collection">The collection</Link><span>/</span><span aria-current="page">{product.title}</span></nav>
        <div className="product-layout">
          <ProductImageView key={product._id} product={product} />
          <ProductDetails key={product._id} product={product} />
        </div>
        <CustomerReviewsContainer productId={product._id} />
      </main>
      <Footer />
    </div>
  );
}
