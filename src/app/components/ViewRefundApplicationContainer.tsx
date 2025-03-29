import { StaticImport } from 'next/dist/shared/lib/get-img-props'
import Image from 'next/image'
import React from 'react'
import { FaArrowLeft } from 'react-icons/fa'

const ViewRefundApplicationContainer = ({ clickedRefund,clickedTab }:any) => {
    return (
        <div className='w-full h-full flex flex-col md:grid grid-cols-2 gap-2 p-5'>
             <FaArrowLeft className='w-9 h-9 p-2 border border-pink-300 flex bg-white rounded-full fixed' onClick={e=>{
          clickedTab('refunds_tab')
        }}/>
            <div className='col-span-1 bg-white shadow-sm rounded-xl p-5 overflow-auto mt-10'>
                <div className='flex gap-4'>
                    <div className='flex gap-3 items-center rounded-lg w-max p-5'>
                        <img src={clickedRefund.order.product.images[0].imageUrl} alt="" width={100} height={100} />
                        <div>
                            <p className='text-sm font-semibold'>{clickedRefund.order.product.title}</p>
                            <div className='flex gap-4 text-lg'>
                                <p>{clickedRefund.order.quantity}</p>
                                <p>*</p>
                                <p>{clickedRefund.order.product.price}</p>
                            </div>
                            <p className='text-2xl text-pink-300 font-bold'>${clickedRefund.order.productQtyPrice}</p>
                        </div>
                    </div>
                </div>
                <div className='flex flex-col gap-1'>
                    <p className='text-sm font-semibold'>Uploaded Images</p>
                    <div className='overflow-x-auto overflow-y-hidden'>
                        {clickedRefund.images.map((item: { url: string | StaticImport }, index: React.Key | null | undefined) => (
                            <div key={index} className='ms-2'>
                                <Image src={item.url} alt='' width={100} height={100} className='rounded-lg' />
                            </div>
                        ))}

                    </div>
                </div>
                <div className='flex flex-col gap-1'>
                    <p className='text-sm font-semibold'>Selected Reason</p>
                    <p className='ms-2'>-{clickedRefund.selectedReason}</p>
                </div>

                <div className='flex flex-col gap-1'>
                    <p className='text-sm font-semibold'>Provided Reason</p>
                    <p className='ms-2'>-{clickedRefund.providedReason}</p>
                </div>
            </div>

            <div className='col-span-1 bg-white shadow-sm rounded-xl p-5 flex flex-col gap-4 mt-10'>
                <p className='text-lg font-semibold text-pink-300 w-full text-center'>Refund Overview</p>
                <div className='flex flex-col gap-2'>
                    {clickedRefund.messages.map((item: any,index: number)=>(
                        <div key={index} className='bg-orange-100 p-1 rounded-md'>
                            <div className='flex gap-2 items-center'>
                            <p className='bg-orange-200 rounded-full p-1 w-10 h-10 flex items-center justify-center text-sm font-semibold text-black'
                            >{index+1}</p>
                            <p>{item.message}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default ViewRefundApplicationContainer
