'use client';
import { useState } from 'react';
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi';
export default function ProductImageView({ product }: { product: { title: string; image?: string; images?: { imageUrl: string }[] } }) {
  const [index, setIndex] = useState(0);
  const images = product.images?.length ? product.images : [{ imageUrl: product.image || '/shopping_girl.png' }];
  return <div className="product-gallery"><img src={images[index].imageUrl} alt={`${product.title}${images.length > 1 ? ` — image ${index + 1}` : ''}`} fetchPriority="high" />{images.length > 1 && <><button className="gallery-arrow" aria-label="Previous image" onClick={() => setIndex(n => (n - 1 + images.length) % images.length)}><FiArrowLeft /></button><button className="gallery-arrow" aria-label="Next image" onClick={() => setIndex(n => (n + 1) % images.length)}><FiArrowRight /></button><span className="gallery-count">{index + 1} / {images.length}</span></>}</div>;
}