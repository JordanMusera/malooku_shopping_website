'use client'
import React, { useState } from 'react'
import { FaStar } from 'react-icons/fa'

const RatingComponent = ({setRatingValue}) => {
  const [rating, setRating] = useState(0);

  const setRatingFn = (value: number) => {
    setRating(value);
    setRatingValue(value);
  }

  return (
    <div className='flex gap-2'>
      {
        [...Array(5)].map((_, index) => (
          <FaStar
            key={index}
            onClick={() => setRatingFn(index + 1)}
            color={index < rating ? "#ffc107" : "#e4e5e9"}
            className='w-10 h-10 hover:cursor-pointer'
          />
        ))
      }
    </div>
  )
}

export default RatingComponent;
