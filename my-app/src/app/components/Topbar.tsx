import Link from 'next/link'

const Topbar = () => {

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
      
     

      <Link href='/' className='text-md font-semibold hover:text-pink-300 group flex items-center'>
      <div>
        <img src='/basket_icon.png' alt='' width={30} height={30}/>
      </div>
      <span className='flex flex-col items-center'>
        Cart
      </span>
      </Link>

      <Link href='/' className='text-xl font-semibold hover:text-green-500 group flex border border-gray-500 rounded-lg hover:border-green-500 p-1'>
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
