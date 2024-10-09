'use client'
import Image from 'next/image';
import Link from 'next/link'
import { ReactNode, useEffect, useState } from 'react';

interface Cart {
  cartData: CartItem[],
  totalCartCost: number
};

interface CartItem {
  rating: {
    rate: number,
    count: number
  },
  _id: string,
  id: number,
  title: string,
  price: number,
  description: string,
  category: string,
  image: string,
  orderedQty: number,
  productQtyPrice: number
}

interface UserItem {
  username: ReactNode;
}

const Topbar = () => {
  const [cartDetails, setCartDetails] = useState<Cart>({ cartData: [], totalCartCost: 0 });
  const [isCartActive, setIsCartActive] = useState(false);
  const [userItem, setUserItem] = useState<UserItem>({});

  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch('/api/users');
      const response = await res.json();

      if (response.success) {
        setUserItem(response.user);
        console.log(response.user);
      }
    }

    fetchUser();
  }, [])

  const fetchCartData = async () => {
    const res = await fetch('/api/cart/user/cart');
    if (res) {
      try {
        const data: Cart = await res.json();
        setCartDetails(data);
      } catch (error) {
        console.log('Login first!')
      }

    }
  }

  const toggleCartVisibility = () => {
    setIsCartActive((prevValue) => {
      const newValue = !prevValue;
      if (newValue) {
        fetchCartData();
      }
      return newValue;
    });
  };


  return (
    <div className='bg-slate-100 py-2 md:px-3 flex justify-between'>
    
          <div className='md:hidden flex ps-2'>
            <img src='/menu_icon.png' alt='' width={40} height={40} />
          </div>

      <Link href='/' className='text-md font-semibold hover:text-pink-300 group hidden md:flex'>
        <span className='flex flex-col items-center'>
          Home
          <hr className='h-1 bg-slate-500 w-10 rounded-sm group-hover:bg-pink-300' />
        </span>
      </Link>

      <Link href='/' className='text-md font-semibold hover:text-pink-300 group hidden md:flex'>
        <span className='flex flex-col items-center'>
          About us
          <hr className='h-1 bg-slate-500 w-10 rounded-sm group-hover:bg-pink-300' />
        </span>
      </Link>


      <div className='w-2/3 md:w-1/3 flex border rounded-2xl border-pink-300'>
        <input type='text' placeholder='Search here' className='w-full rounded-s-2xl px-2' />
        <button title='h' >
          <img src='/search_icon.png' alt='' width={30} height={30} />
        </button>
      </div>


      <div className='relative' onClick={() => toggleCartVisibility()}>
        <Link href='' className='text-md font-semibold hover:text-pink-300 md:group flex items-center px-3'>
          <div>
            <img src='/basket_icon.png' alt='' width={30} height={30} />
          </div>
          <span className='flex-col items-center hidden md:flex'>
            Cart
            <hr
              className={`h-1 w-10 rounded-sm transition-colors duration-300 ${isCartActive ? 'bg-pink-300' : 'bg-gray-500'
                }`}
            />
          </span>
        </Link>
        </div>

        {isCartActive && (
          <div className='absolute w-screen p-5 sm:bottom-0 h-[calc(100vh-37px)] md:w-max md:h-max md:max-h-[500px] bg-gray-100 top-[40px] md:top-[50px] z-10 right-0 md:rounded-md md:border border-pink-300 overflow-auto'>
            <p className='text-lg font-bold m-1 flex justify-center'>My Cart</p>
            <hr className='h-[2px] bg-pink-300' />


            {cartDetails.cartData.map(product => (
              <div key={product.id} className='flex items-center gap-2 p-2'>
                <div className='flex flex-col justify-center items-center'>
                  <button className='bg-pink-300 rounded-full w-6 h-6 flex items-center justify-center font-bold'>+</button>
                  <p className='font-bold'>{product.orderedQty}</p>
                  <button className='bg-gray-300 rounded-full w-6 h-6 flex items-center justify-center font-bold'>-</button>
                </div>
                <div className='w-full border border-gray-100 flex items-center'>
                  <Image src={product.image} alt="" width={80} height={80} className='rounded-md' />
                  <div>
                    <p className='text-sm font-semibold text-black'>{product.title}</p>
                    <div className='flex flex-col'>
                      <p className='text-sm font-bold text-gray-600'>Price: ${product.price}</p>
                      <p className='text-sm font-bold text-green-500'><span className='text-gray-600'>T.Cost:</span> ${product.productQtyPrice}</p>
                    </div>
                  </div>

                </div>

                <div className='w-8 h-8 hover:h-10 hover:w-10 cursor-pointer'>
                  <img src='/delete_icon.png' alt='' sizes='full' />
                </div>


              </div>
            ))}



            <hr className='h-[2px] bg-pink-300' />

            <div className='flex justify-between items-center px-4 py-2'>
              <div className='flex flex-col items-center justify-center'>
                <p className='text-sm font-bold m-1 text-gray-600'>Total Cost</p>
                <p className='text-lg font-bold m-1 text-black'>${cartDetails.totalCartCost}</p>
              </div>
              <button className='border-[2px] border-pink-300 rounded-xl bg-gray-300 h-8 w-20 flex items-center justify-center hover:bg-pink-300'>Checkout</button>
            </div>


          </div>
        )}


      <Link href='/account' className='text-xl font-semibold hover:text-green-500 group flex border border-gray-500 rounded-lg hover:border-green-500 p-1 gap-1
      hidden md:flex'>
        <div>
          <img src='/user_icon.png' alt='' width={30} height={30} />
        </div>
        <span className='flex flex-col items-center text-sm font-medium justify-center'>
          {userItem.username}
        </span>
      </Link>
    </div>
  )
}

export default Topbar
