'use client'
import React, { useEffect, useState } from 'react';
import { Button, Dropdown, Menu, Table, message } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import Image from 'next/image';

const SellerOrders = () => {
    const [ordersArr, setOrdersArr] = useState<any>([]);

    useEffect(() => {
        const fetchOrders = async () => {
            const res = await fetch('/api/orders/controller', {
                method: 'GET'
            });
            if (res.ok) {
                const response = await res.json();
                if (response.success) {
                    setOrdersArr(response.content);
                }
            }
        };
        fetchOrders();
    }, []);

    const handleStatusChange = (status:any, record:any) => {
        const updatedData = ordersArr.map((item:any) =>
            item._id === record._id ? { ...item, status } : item
        );
        setOrdersArr(updatedData);
        updateDbOrderStatus(status,record._id)
        message.success(`Status updated to ${status}`);
    };

    const updateDbOrderStatus=async(orderStatus:any,orderId:any)=>{
        const res = await fetch('/api/orders/controller',{
            method:'POST',
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify({
                orderStatus:orderStatus,
                orderId:orderId
            })
        });

        if(res.ok){
            const response = await res.json();
            if(response.success){
                message.success(response.message);
            }else{
                message.error(response.message);
            }
        }
    }

    const getStatusMenu = (record:any) => (
        <Menu onClick={({ key }) => handleStatusChange(key, record)}>
            <Menu.Item key="pending">pending</Menu.Item>
            <Menu.Item key="shipped">shipped</Menu.Item>
            <Menu.Item key="delivered">delivered</Menu.Item>
            <Menu.Item key="cancelled">canceled</Menu.Item>
        </Menu>
    );

    const orderColumns = [
        { title: 'Order ID', dataIndex: '_id', key: '_id' },
        { title: 'User ID', dataIndex: 'userId', key: 'userId' },
        {
            title: 'Shipping Address',
            key: 'shippingAddress',
            render: (_:any, record:any) => (
                `${record.shippingAddress.street}, ${record.shippingAddress.city}, ${record.shippingAddress.county}, ${record.shippingAddress.postalCode}`
            ),
        },
        { title: 'Total Cost', dataIndex: 'totalCost', key: 'totalCost' },
        {
            title: 'Status',
            key: 'status',
            render: (_:any, record:any) => (
                <Dropdown overlay={getStatusMenu(record)} trigger={['click']}>
                    <Button>
                        {record.status} <DownOutlined />
                    </Button>
                </Dropdown>
            ),
        },
        { title: 'Order Date', dataIndex: 'orderDate', key: 'orderDate' },
    ];

    const productColumns = [
        { title:'Image',key:'_id',dataIndex:['product','image'],
            render:(url:any)=>(
                <div>
                    <Image src={url} alt='image' width={100} height={100} className='w-10 h-10 object-contain'/>
                </div>
                
            )
        },
        { title: 'Product ID', dataIndex: ['product', '_id'], key: '_id' },
        { title: 'Title', dataIndex: ['product', 'title'], key: 'title' },
        { title: 'Category', dataIndex: ['product', 'category'], key: 'category' },
        { title: 'Price', dataIndex: ['product', 'price'], key: 'price' },
        { title: 'Quantity', dataIndex: 'quantity', key: 'quantity' },
        { title: 'Total Price', dataIndex: 'productQtyPrice', key: 'productQtyPrice' },
    ];

    const expandedRowRender = (record:any) => {
        return (
            <Table
                columns={productColumns}
                dataSource={record.products}
                pagination={false}
                rowKey={(record:any) => record.product._id}
            />
        );
    };

    return (
        <div className="w-full h-full p-10">
            <Table
                columns={orderColumns}
                dataSource={ordersArr}
                expandable={{
                    expandedRowRender,
                    rowExpandable: () => true,
                }}
                rowClassName={(record) =>
                    record.status === 'pending' ? 'bg-orange-100' : record.status == 'delivered' ? 'bg-green-100':'bg-pink-100'
                }
                rowKey="_id"
            />
        </div>
    );
};

export default SellerOrders;
