import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "../../authenticate/functions/auth";
import User from "@/app/models/user";
import ProductReview from "@/app/models/product_review";
import dbConnect from "@/app/config/database";

export async function POST(request:NextRequest){
    try {
        await dbConnect();

        const authToken = request.cookies.get('authToken')?.value||'';
        if(!authToken){
            return NextResponse.json({redirect:true,url:'/login'});
        }
        const authObj = await verifyToken(authToken);
        const userId = authObj.userId;
    
        const user = await User.findById(userId);
        if(!user){
            return NextResponse.json({success:false,message:'User not authenticated'});
        }
    
        const {productId,reviewId,reply} = await request.json();
    
        const productReviews = await ProductReview.findOne({productId:productId});
        if(productReviews){
            for(const review of productReviews.comments){
                if(review._id.toString()===reviewId){
                    review.replies = [...review.replies,{
                        userName:user.username,
                        userId:userId,
                        reply:reply
                    }]
                }
            }
    
            await productReviews.save();
            return NextResponse.json({success:true,message:'Reply Posted',content:productReviews});
        }
    } catch (error) {
        console.log(error)
        return NextResponse.json({success:false,message:'Some server error occurred'})
    }
   
}