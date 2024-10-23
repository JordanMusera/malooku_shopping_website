import { verifyToken } from "@/app/api/authenticate/functions/auth";
import dbConnect from "@/app/config/database";
import OrderProgress from "@/app/models/orderprogress";
import User from "@/app/models/user";
import { NextRequest, NextResponse } from "next/server";

interface Params{
    params:{
        id:Number
    }
}

export async function GET(request:NextRequest,{params}:Params){
    await dbConnect();

    const authToken = request.cookies.get('authToken')?.value||'';
    const authObj = verifyToken(authToken);
    const userId = (await authObj).userId;
    const {id} = params;

    const user = await User.findById(userId);
    if(user){
        console.log("ID: "+id)
        const orderProgress = await OrderProgress.findOne({orderId:id});
        if(orderProgress){
            return NextResponse.json({success:true,message:'Order found',content:orderProgress});
        }

        return NextResponse.json({success:false,message:'Order not found'})
    }
}