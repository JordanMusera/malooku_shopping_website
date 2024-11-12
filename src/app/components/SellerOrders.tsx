'use client'
import React, { useEffect, useState } from 'react';
import { Button, Dropdown, Menu, Table, message } from 'antd';
import { DownOutlined } from '@ant-design/icons';

const SellerOrders = () => {
    const [ordersArr, setOrdersArr] = useState([]);

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

    const handleStatusChange = (status, record) => {
        const updatedData = ordersArr.map((item) =>
            item._id === record._id ? { ...item, status } : item
        );
        setOrdersArr(updatedData);
        message.success(`Status updated to ${status}`);
    };

    const getStatusMenu = (record) => (
        <Menu onClick={({ key }) => handleStatusChange(key, record)}>
            <Menu.Item key="pending">Pending</Menu.Item>
            <Menu.Item key="shipped">Shipped</Menu.Item>
            <Menu.Item key="delivered">Delivered</Menu.Item>
            <Menu.Item key="canceled">Canceled</Menu.Item>
        </Menu>
    );

    const orderColumns = [
        { title: 'Order ID', dataIndex: '_id', key: '_id' },
        { title: 'User ID', dataIndex: 'userId', key: 'userId' },
        {
            title: 'Shipping Address',
            key: 'shippingAddress',
            render: (_, record) => (
                `${record.shippingAddress.street}, ${record.shippingAddress.city}, ${record.shippingAddress.county}, ${record.shippingAddress.postalCode}`
            ),
        },
        { title: 'Total Cost', dataIndex: 'totalCost', key: 'totalCost' },
        {
            title: 'Status',
            key: 'status',
            render: (_, record) => (
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
        { title: 'Product ID', dataIndex: ['product', '_id'], key: '_id' },
        { title: 'Title', dataIndex: ['product', 'title'], key: 'title' },
        { title: 'Category', dataIndex: ['product', 'category'], key: 'category' },
        { title: 'Price', dataIndex: ['product', 'price'], key: 'price' },
        { title: 'Quantity', dataIndex: 'quantity', key: 'quantity' },
        { title: 'Total Price', dataIndex: 'productQtyPrice', key: 'productQtyPrice' },
    ];

    const expandedRowRender = (record) => {
        return (
            <Table
                columns={productColumns}
                dataSource={record.products}
                pagination={false}
                rowKey={(record) => record.product._id}
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
