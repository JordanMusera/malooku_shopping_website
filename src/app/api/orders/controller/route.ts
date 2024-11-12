import dbConnect from "@/app/config/database";
import Order from "@/app/models/order";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request:NextRequest){
    try {
     await dbConnect();

    const orders = await Order.find({});
    if(orders){
        return NextResponse.json({success:true,message:'Orders fetched',content:orders});
    }   
    return NextResponse.json({success:false,message:'No orders found!'})
    } catch (error) {
        return NextResponse.json({success:false,message:'Server error occurred!'});
    }
    
}

export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        const { orderId, orderStatus } = await request.json();
      
        const order = await Order.findById(orderId);

        if (order) {
            order.status = orderStatus;
            await order.save();

            return NextResponse.json({ success: true, message: 'Status updated successfully' });
        }

        return NextResponse.json({ success: false, message: 'Order not found!' });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'Some server error occurred' });
    }
}
