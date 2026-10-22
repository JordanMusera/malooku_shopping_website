import { Table } from 'antd';
import React, { useEffect, useState } from 'react'

const SellerUsersContainer = () => {
    const [users,setUsers] = useState([])
    useEffect(()=>{
        const fetchUsers=async()=>{
            const res = await fetch('/api/users/controller',{
                method:'GET'
            });
            if(res.ok){
                const response = await res.json();
                if(response.success){
                    setUsers(response.content);
                }
            }
        }
        fetchUsers();
    },[]);

    const columns=[
        {
            title:'Username',
            dataIndex:'username',
            key:'_id'
        },
        {
            title:'Email',
            dataIndex:'email',
            key:'_id'
        },
        {
            title:'Full Name',
            key:'_id',
            render: (_:any,record:any)=>(
                <span>{record.fullname || (record.name ? [record.name.firstname, record.name.lastname].filter(Boolean).join(' ') : '—')}</span>
            )
        },
        {
            title:'Phone',
            key:'_id',
            render:(record:any)=>(
                record.phone
                ?<p>{record.phone}</p>
                :<p>—</p>
            )
        },
        {
            title:'Id',
            dataIndex:'_id',
            key:'_id'
        },
        {
            title: 'Shipping Address',
            key: 'address',
            render: (_:any, record:any) => (
                record.address
                    ? `${record.address.street}, ${record.address.city}, ${record.address.county}`
                    : 'No Address'
            ),
        },

    ]
  return (
    <div className='admin-card admin-data-section'>
      <div className="admin-card-heading"><div><h2>Customer directory</h2><p>{users.length} registered accounts</p></div></div><Table columns={columns} dataSource={users} rowKey="_id" scroll={{x:850}}/>
    </div>
  )
}

export default SellerUsersContainer
