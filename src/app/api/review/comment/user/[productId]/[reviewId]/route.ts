import { verifyToken } from "@/app/api/authenticate/functions/auth";
import dbConnect from "@/app/config/database";
import ProductReview from "@/app/models/product_review";
import PurchasedProduct from "@/app/models/purchased_product";
import User from "@/app/models/user";
import { NextRequest, NextResponse } from "next/server";

interface Params{
    params:{
        id:string
    }
}


export async function DELETE(request:NextRequest,{params}:Params){
    try {
        await dbConnect();
         const authToken = request.cookies.get('authToken')?.value||'';
    const authObj = await verifyToken(authToken);
    const userId = authObj.userId;

    const {productId,reviewId}:any = params;

    const user = await User.findById(userId);
    if(user){
        const reviews = await ProductReview.findOne({productId});

        if (reviews) {
            reviews.comments = reviews.comments.filter(
                (item: any) => item._id.toString() !== reviewId
            );
    
            await reviews.save();

            const purchasedProducts = await PurchasedProduct.findOne({userId:userId});

            const purchasedProductIndex = purchasedProducts.purchasedList.findIndex((item:any)=>item.productId===productId);

            if(purchasedProductIndex!==-1){
                purchasedProducts.purchasedList[purchasedProductIndex].reviewed=false;

                await purchasedProducts.save();
            }
    
            return NextResponse.json({
                success: true,
                message: 'Review deleted',
                content: reviews.comments
            });
        } else {
            return NextResponse.json({
                success: false,
                message: 'Product review not found'
            });
        }
    }else{
        return NextResponse.json({success:false,message:'User not authenticated'})
    }
    } catch (error) {
        console.log(error);
        return NextResponse.json({success:false,message:'Some server error occurred!'})
    }
   
}