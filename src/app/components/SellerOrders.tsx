'use client'
import React, { useEffect, useRef, useState } from 'react';
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

    const [savingOrder, setSavingOrder] = useState<string | null>(null);
    const savingRef = useRef(false);
    const handleStatusChange = async (status: string, record: any) => {
        if (savingRef.current || record.status === status) return;
        savingRef.current = true;
        setSavingOrder(record._id);
        try {
            const res = await fetch('/api/orders/controller', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderStatus: status, orderId: record._id }),
            });
            const response = await res.json();
            if (!res.ok || !response.success || !response.content) throw new Error(response.message || 'Unable to save the status.');
            setOrdersArr((orders: any[]) => orders.map(item => item._id === record._id ? response.content : item));
            message.success(response.message);
        } catch (error) {
            message.error(error instanceof Error ? error.message : 'Unable to save the status. Please try again.');
        } finally {
            savingRef.current = false;
            setSavingOrder(null);
        }
    };

    const getStatusMenu = (record:any) => (
        <Menu onClick={({ key }) => handleStatusChange(key, record)}>
            <Menu.Item key="pending">pending</Menu.Item>
            <Menu.Item key="shipped">shipped</Menu.Item>
            <Menu.Item key="delivered">delivered</Menu.Item>
            <Menu.Item key="cancelled">canceled</Menu.Item>
        </Menu>
    );

    const orderColumns = [
        { title: 'Order', dataIndex: '_id', key: '_id', render:(id:string)=>'#'+id.slice(-8).toUpperCase() },

        {
            title: 'Shipping Address',
            key: 'shippingAddress',
            render: (_:any, record:any) => (
                `${record.shippingAddress?.street ?? ""}, ${record.shippingAddress?.city ?? ""}, ${record.shippingAddress?.county ?? ""}, ${record.shippingAddress?.postalCode ?? ""}`
            ),
        },
        { title: 'Total', dataIndex: 'totalCost', key: 'totalCost', render:(n:number)=>'KSh '+Number(n||0).toLocaleString() },
        {
            title: 'Status',
            key: 'status',
            render: (_:any, record:any) => (
                <Dropdown overlay={getStatusMenu(record)} trigger={['click']} disabled={!!savingOrder}>
                    <Button loading={savingOrder === record._id} disabled={!!savingOrder}>
                        {record.status} <DownOutlined />
                    </Button>
                </Dropdown>
            ),
        },
        { title: 'Date', dataIndex: 'orderDate', key: 'orderDate', render:(value:string)=>value?new Date(value).toLocaleDateString('en-GB'):'—' },
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
                scroll={{x:720}}
                columns={productColumns}
                dataSource={record.products}
                pagination={false}
                rowKey={(record:any) => record.product._id}
            />
        );
    };

    return (
        <div className="admin-card admin-data-section">
            <div className="admin-card-heading"><div><h2>All orders</h2><p>Manage fulfilment and delivery status</p></div></div>
            <Table
                scroll={{x:960}}
                columns={orderColumns}
                dataSource={ordersArr}
                expandable={{
                    expandedRowRender,
                    rowExpandable: () => true,
                }}
                rowKey="_id"
            />
        </div>
    );
};

export default SellerOrders;
