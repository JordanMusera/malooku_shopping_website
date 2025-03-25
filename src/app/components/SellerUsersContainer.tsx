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
            render: (_,record)=>(
                record.name
                ?<p>{record.name.firstname}  {record.name.lastname}</p>
                :<p>Null</p>
            )
        },
        {
            title:'Phone',
            key:'_id',
            render:(record)=>(
                record.phone
                ?<p>{record.phone}</p>
                :<p>Null</p>
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
            render: (_, record) => (
                record.address
                    ? `${record.address.street}, ${record.address.city}, ${record.address.county}`
                    : 'No Address'
            ),
        },

    ]
  return (
    <div className='p-10 w-full'>
      <Table columns={columns} dataSource={users}/>
    </div>
  )
}

export default SellerUsersContainer
