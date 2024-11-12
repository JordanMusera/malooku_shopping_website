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