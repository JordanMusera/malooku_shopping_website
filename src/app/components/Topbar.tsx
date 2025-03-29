'use client'
import Image from 'next/image';
import Link from 'next/link'
import { AwaitedReactNode, JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCart, addItem, minusItem, deleteItem } from '@/store/cartSlice';
import { RootState } from '@/store/store';
import { StaticImport } from 'next/dist/shared/lib/get-img-props';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/ReactToastify.css';
import { FaChevronDown } from 'react-icons/fa';


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
  productQtyPrice: number,
  images:any
}

interface UserItem {
  username: string,
  email: string,
  role: string
}

const Topbar = () => {
  const [cartDetails, setCartDetails] = useState<Cart>({ cartData: [], totalCartCost: 0 });
  const [isCartActive, setIsCartActive] = useState(false);
  const [userItem, setUserItem] = useState<UserItem | null>(null);
  const [minmenu, setMinmenu] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [cartState,setCartState] = useState('Loading...')

  const router = useRouter();


  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch('/api/users');

      if (res.ok) {
        const response = await res.json();

        if (response.success) {
          setUserItem(response.user);
          console.log(response.user);
        }
      }

    }

    const delayDebounce = setTimeout(() => {
      searchItem(searchText);
  }, 500); // 500ms debounce delay

  return () => clearTimeout(delayDebounce);

    fetchUser();
  }, [searchText])

  const fetchCartData = async () => {
    const res = await fetch('/api/cart/user');
    if (res.ok) {
      try {
        const data: Cart = await res.json();
        if(data.cartData.length==0){
          setCartState("Cart is Empty")
        }

        dispatch(setCart(data))


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

  const navigatePlaceOrdersPage = () => {
    if (cartItems.length != 0) {
      router.push('/placeOrder');
    } else {
      toast.error('Cart is empty!')
    }

  }

  const navigateHomePage = () => {
    router.push('/');
    setMinmenu(false);
  }

  const navigateAccountPage = () => {
    router.push('/account');
    setMinmenu(false);
  }

  const navigateAboutUs = () => {
    router.push('/aboutus');
    setMinmenu(false);
  }

  const showCart = () => {
    setIsCartActive(true);
    setMinmenu(false);
    setCartState('Loading...')
    fetchCartData();
  }

  const { cartItems, loading, totalAmount } = useSelector(
    (state: RootState) => state.cart
  );

  const handleAddToCart = (cartItem: CartItem) => {
    dispatch(addItem(cartItem));
  };

  const handleMinusFromCart = (cartItem: CartItem) => {
    dispatch(minusItem(cartItem));
  };

  const handleDeleteFromCart = (cartItem: CartItem) => {
    dispatch(deleteItem(cartItem));
  };

  const handleMenuClick = () => {
    setMinmenu((prev) => !prev);
    setIsCartActive(false)
  }

  const searchItem = async (search: string) => {
    const res = await fetch(`/api/products/search/${search}`)


    if (res.ok) {
      const data = await res.json();
      console.log(data);
      setSearchResults(data);
    }

  }

  const selectSearchItem = async (item:any)=>{
    router.push(`/viewProduct/${item._id}`)
  }


  return (
    <div className='bg-slate-100 py-2 md:px-6 flex justify-between items-center z-100'>

      <div className='md:hidden flex ps-2' onClick={() => handleMenuClick()}>
        <img src='/menu_icon.png' alt='' width={40} height={40} />
      </div>

      <label className='font-extrabold text-2xl text-pink-300 hidden md:flex'>MALOOKU</label>

      <Link href='/' className='text-md h-full font-semibold hover:text-pink-300 group hidden md:flex'>
        <span className='flex flex-col items-center'>
          Home
        </span>
      </Link>

      <Link href='/' className='text-md font-semibold hover:text-pink-300 group hidden md:flex'>
        <span className='flex flex-col items-center'>
          About us
        </span>
      </Link>


      <form className='w-2/3 md:w-1/3 h-full flex border rounded-2xl border-pink-300 relative'>
        <input type='text' placeholder='Search here' className='w-full rounded-s-2xl p-2' onChange={e => setSearchText(e.target.value)} />
        <button title='h-full' type='submit' onClick={()=>searchItem(searchText)}>
          <img src='/search_icon.png' alt='' width={30} height={30} />
        </button>

        {searchResults.length > 0 && searchText.length > 0 && (
          <div className='w-full h-max max-h-56 mt-12 bg-white border border-pink-300 shadow-2xl rounded-md flex absolute flex-col p-2 overflow-y-auto'>
            {searchResults.map((item: any, index) => (
              <div key={index} className='m-2 text-black font-serif hover:text-pink-400 cursor-pointer' onClick={()=>selectSearchItem(item)}>
                <p>{item.title}</p>
                <hr />
              </div>
            ))}
          </div>
        )}

</form>

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
          <div className='absolute w-screen p-5 xl:w-1/3 sm:bottom-0 h-[calc(100vh-37px)] mt-3 xl:mr-2 md:w-max md:h-max md:max-h-[500px] bg-gray-100 top-[40px] md:top-[50px] z-10 right-0 md:rounded-md md:border border-pink-300 overflow-auto'>
            <p className='text-lg font-bold m-1 flex justify-center'>My Cart</p>
            <hr className='h-[2px] bg-pink-300' />

            {cartItems.length === 0 ? (
              <div className='w-full h-1/2 xl:h-20 flex justify-center items-center'>
                <p className='text-xl font-semi-bold text-red-500'>{cartState}</p>
              </div>
            ) : (
              <div>
                {cartItems.map((product) => (
                  <div key={product.id} className='flex items-center gap-2 p-2'>
                    <div className='flex flex-col justify-center items-center'>
                      <button className='bg-pink-300 rounded-full w-6 h-6 flex items-center justify-center font-bold' onClick={() => handleAddToCart(product)}>+</button>
                      <p className='font-bold'>{product.orderedQty}</p>
                      <button className='bg-gray-300 rounded-full w-6 h-6 flex items-center justify-center font-bold' onClick={() => handleMinusFromCart(product)}>-</button>
                    </div>
                    <div className='w-full border border-gray-100 flex items-center gap-3'>
                      <Image src={product.images[0].imageUrl} alt="" width={80} height={80} className='rounded-md' />
                      <div>
                        <p className='text-sm font-semibold text-black'>{product.title.length>50 ? product.title.slice(0,50)+'...' : product.title}</p>
                        <div className='flex flex-col'>
                          <p className='text-sm font-bold text-gray-600'>Price: Ksh.{product.price}</p>
                          <p className='text-sm font-bold text-green-500'><span className='text-gray-600'>T.Cost:</span> Ksh.{product.productQtyPrice}</p>
                        </div>
                      </div>

                    </div>

                    <div className='w-8 h-8 hover:h-10 hover:w-10 cursor-pointer' onClick={() => handleDeleteFromCart(product)}>
                      <img src='/delete_icon.png' alt='' sizes='full' />
                    </div>


                  </div>
                ))}

              </div>
            )

            }



            <hr className='h-[2px] bg-pink-300' />

            <div className='flex justify-between items-center px-4 py-2'>
              <div className='flex flex-col items-center justify-center'>
                <p className='text-sm font-bold m-1 text-gray-600'>Total Cost</p>
                <p className='text-lg font-bold m-1 text-black'>${totalAmount}</p>
              </div>
              <button className='border-[2px] border-pink-300 rounded-xl bg-gray-300 h-8 w-20 flex items-center justify-center hover:bg-pink-300'
                onClick={() => navigatePlaceOrdersPage()}>Checkout</button>
              <ToastContainer />
            </div>


          </div>
        )}


        <Link href='/account' className='flex gap-2 items-center justify-end me-3'>
          <div className='h-10 w-10 rounded-full bg-pink-100 flex items-center justify-center'>
            <img src="/user_icon.png" alt="" width={30} height={30} className='object-contain' />
          </div>
          <div className='text-start text-sm hidden md:flex md:flex-col'>
            <p className='text-gray-600'>{userItem?.role}</p>
            <p className='text-black'>{userItem?.email}</p>
          </div>
          <FaChevronDown className='hidden md:flex' />
        </Link>

        {minmenu && (
          <div className='absolute bg-gray-300 h-screen md:hidden top-[55px] w-full flex flex-col items-center justify-center gap-20 z-20'>
            <button onClick={() => navigateHomePage()} className='w-max text-pink-400 text-2xl font-serif font-bold'>Home</button>
            <button onClick={() => showCart()} className='w-max text-pink-400 text-2xl font-serif font-bold'>Cart</button>
            <button onClick={() => navigateAccountPage()} className='w-max text-pink-400 text-2xl font-serif font-bold'>Account</button>
            <button onClick={() => navigateAboutUs()} className='w-max text-pink-400 text-2xl font-serif font-bold'>About us</button>
          </div>
        )}
      </div>
      )
}

      export default Topbar
