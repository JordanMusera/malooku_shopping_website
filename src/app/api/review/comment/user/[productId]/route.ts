import { verifyToken } from "@/app/api/authenticate/functions/auth";
import dbConnect from "@/app/config/database";
import ProductReview from "@/app/models/product_review";
import User from "@/app/models/user";
import { NextRequest, NextResponse } from "next/server";

interface Params{
    params:{
        id:string
    }
}

export async function GET(request:NextRequest,{params}:Params){
    try {
        await dbConnect();
    const authToken = request.cookies.get('authToken')?.value||'';
    const authObj = await verifyToken(authToken);
    const userId = authObj.userId;

    const {productId} = params;

    const user = await User.findById(userId);
    if(user){
        const productReviews = await ProductReview.findOne({productId:productId});
        const filteredProductReviews = productReviews.comments.filter((item:any)=>item.userId===userId);
        return NextResponse.json({success:true,message:'Reviews fetched',content:filteredProductReviews});
    }else{
        return NextResponse.json({success:false,message:'User not authenicated'});
    }
    } catch (error) {
        return NextResponse.json({success:false,message:'Some server error occurred!'});
    }
    
}