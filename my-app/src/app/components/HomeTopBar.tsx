import React from 'react';

const HomeTopBar = () => {
  return (
    <div className='bg-pink-300 w-full h-full rounded-2xl px-3 relative flex items-center justify-between'>
      <div className='mx-8'>
        <p>
          <span className='text-black font-extrabold text-3xl'>SHOP ONLINE!</span>
           <br />
           <span className='text-gray-800 font-semibold text-xl'>
            Get 30% discount
           </span>
           
        </p>
      </div>
      
      <div className='h-full'>
        <img className='h-full object-contain'
        src='/shopping_girl.png' sizes='full' alt='Shopping Girl' />
      </div>
      
    </div>
  );
}

export default HomeTopBar;
