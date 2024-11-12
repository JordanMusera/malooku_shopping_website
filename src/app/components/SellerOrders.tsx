import React, { useEffect, useState } from 'react'

const SellerOrders = () => {
    const [ordersArr,setOrdersArr] = useState([])

    useEffect(()=>{
        const fetchOrders=async()=>{
            const res = await fetch('/api/orders/controller',{
                method:'GET'
            });
            if(res.ok){
                const response = await res.json();
                if(response.success){
                    setOrdersArr(response.content);
                }
            }
        }
    })
  return (
    <div>
        Seller Orders
    </div>
  )
}

export default SellerOrders
