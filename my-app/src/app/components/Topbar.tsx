'use client'
import Image from 'next/image';
import Link from 'next/link'
import { useState } from 'react';

interface Cart{
  cartData:CartItem[],
  totalCartCost:number
};

interface CartItem{
  rating:{
    rate:number,
    count:number
  },
  _id:string,
  id:number,
  title:string,
  price:number,
  description:string,
  category:string,
  image:string,
  orderedQty:number,
  productQtyPrice:number
}

const Topbar = () => {
  const[cartDetails,setCartDetails] = useState<Cart>({cartData:[],totalCartCost:0});
  const[isCartActive,setIsCartActive] = useState(false);
  
  const fetchCartData=async()=>{
    const res = await fetch('/api/cart/user/1');
    if(res){
      const data:Cart = await res.json();
      setCartDetails(data);
    }
  }

  const toggleCartVisibility=()=>{
    setIsCartActive((prevValue)=>!prevValue);
    if(isCartActive){
      fetchCartData();
    }
  }


  return (
    <div className='bg-slate-100 py-2 px-3 flex justify-between'>
      <Link href='/' className='text-md font-semibold hover:text-pink-300 group'>
      <span className='flex flex-col items-center'>
        Home
        <hr className='h-1 bg-slate-500 w-10 rounded-sm group-hover:bg-pink-300'/>
      </span>
      </Link>

      <Link href='/' className='text-md font-semibold hover:text-pink-300 group'>
      <span className='flex flex-col items-center'>
        About us
        <hr className='h-1 bg-slate-500 w-10 rounded-sm group-hover:bg-pink-300'/>
      </span>
      </Link>

     
     <div className='w-1/3 flex border rounded-2xl border-pink-300'>
        <input type='text' placeholder='Search here' className='w-full rounded-s-2xl px-2'/>
        <button title='h' >
            <img src='/search_icon.png' alt='' width={30} height={30}/>
        </button>
     </div>
      
     
<div className='relative'>
   <Link href='' className='text-md font-semibold hover:text-pink-300 group flex items-center'
   onClick={()=>toggleCartVisibility()}>
      <div>
        <img src='/basket_icon.png' alt='' width={30} height={30}/>
      </div>
      <span className='flex flex-col items-center'>
        Cart
        <hr 
        className={`h-1 w-10 rounded-sm transition-colors duration-300 ${
          isCartActive ? 'bg-pink-300' : 'bg-gray-500'
        }`}
      />
      </span>
      </Link>

{isCartActive &&(
  <div className='absolute w-[300px] h-[500px] bg-gray-100 top-[50px] z-10 rounded-md border border-pink-300 overflow-auto'>
      <p className='text-lg font-bold m-1 flex justify-center'>My Cart</p>
      <hr className='h-[2px] bg-pink-300'/>


{cartDetails.cartData.map(product=>(
        <div key={product.id} className='flex items-center gap-2 p-2'>
          <div className='flex flex-col justify-center items-center'>
            <button className='bg-pink-300 rounded-full w-6 h-6 flex items-center justify-center font-bold'>+</button>
            <p className='font-bold'>{product.orderedQty}</p>
            <button className='bg-gray-300 rounded-full w-6 h-6 flex items-center justify-center font-bold'>-</button>
          </div>
          <div className='w-full border border-gray-100 flex items-center'>
            <Image src={product.image} alt="" width={80} height={80} className='rounded-md'/>
            <div>
            <p className='text-sm font-semibold text-black'>{product.title}</p>
              <div className='flex flex-col'>
                <p className='text-sm font-bold text-gray-600'>Price: ${product.price}</p>
                <p className='text-sm font-bold text-green-500'><span className='text-gray-600'>T.Cost:</span> ${product.productQtyPrice}</p>
              </div>
            </div>
            
          </div>

        </div>
      ))}

     

<hr className='h-[2px] bg-pink-300'/>

<div className='flex justify-between items-center px-4 py-2'>
  <div className='flex flex-col items-center justify-center'>
  <p className='text-sm font-bold m-1 text-gray-600'>Total Cost</p>
  <p className='text-lg font-bold m-1 text-black'>${cartDetails.totalCartCost}</p>
</div>
<button className='border-[2px] border-pink-300 rounded-xl bg-gray-300 h-8 w-20 flex items-center justify-center hover:bg-pink-300'>Checkout</button>
</div>


  </div>
)}
      
     </div>

      <Link href='/login' className='text-xl font-semibold hover:text-green-500 group flex border border-gray-500 rounded-lg hover:border-green-500 p-1'>
      <div>
        <img src='/user_icon.png' alt='' width={30} height={30}/>
      </div>
      <span className='flex flex-col items-center'>
        Login
      </span>
      </Link>
    </div>
  )
}

export default Topbar
