'use client'
import { Spin } from 'antd'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { LoadingOutlined } from '@ant-design/icons'

interface Product {
  _id: string,
  id: number,
  title: string,
  price: number,
  description: string,
  category: string,
  image: string,
  rating: {
    rate: number,
    count: number
  },
  images:any
}

const HomeProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch('/api/products',{ cache: 'no-store' });
      if (res.ok) {
        const products: Product[] = await res.json();
        setProducts(products);
      }
    }
    fetchData();
  }, []);

  const productClicked = (product: Product) => {
    router.push(`/viewProduct/${product._id}`);
  };

  const customIcon = <LoadingOutlined className='text-pink-300 size-10' spin />;

  return (
    <div className='flex items-center justify-center relative'>
      {products.length !== 0 ? (
        <div className='grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-5 xl:gap-10 w-full justify-center px-3'>
          {products.map(product => (
            <div
              key={product.id}
              className='flex flex-col justify-between items-center rounded-xl bg-white border hover:border-pink-300 p-1 cursor-pointer'
              onClick={() => productClicked(product)}
            >
              <div className='h-48 w-full flex'>
                <img
                  className='rounded w-full h-full object-contain'
                  src={product?.images[1]?.imageUrl}
                  alt={product.title}
                  sizes='(max-width: 640px) 100px, (max-width: 768px) 150px, (max-width: 1024px) 200px, 300px'
                />
              </div>

              <p className='text-sm font-semibold px-2'>{product.title.length > 20 ? product.title.slice(0, 40) + "..." : product.title}</p>
              <p className='text-xl w-full px-2 font-medium text-pink-400'>${product.price}</p>
            </div>
          ))}
        </div>
      ) : (
        // Center the loading spinner on the screen
        <div className="fixed inset-0 flex items-center justify-center bg-white z-50 mt-14">
          <Spin spinning={true} size='large' indicator={customIcon} />
        </div>
      )}
    </div>
  );
}

export default HomeProducts;
