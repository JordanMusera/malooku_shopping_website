import React from 'react'

const ReviewedContainer = ({clickedTab}) => {

    const handleClickedTab=(tab:string)=>{
      clickedTab(tab)
    }

  return (
    <div className='gap-2 flex flex-col w-full h-full p-3 md:p-5'>
            <div className='top-0 w-full justify-between flex gap-2'>
                <button className='w-full text-md text-black font-semibold border border-pink-300 bg-white rounded-md px-2'
                onClick={()=>handleClickedTab('pending_review_tab')}>Pending Review</button>
                <button className='w-full text-md text-black font-semibold border border-pink-300 bg-pink-300 rounded-md px-2'
                onClick={()=>handleClickedTab('reviewed_tab')}>Reviewed</button>
            </div>
      <p>Review Container</p>
    </div>
  )
}

export default ReviewedContainer
