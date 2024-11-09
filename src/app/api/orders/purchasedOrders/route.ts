import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "../../authenticate/functions/auth";
import PurchasedProduct from "@/app/models/purchased_product";
import dbConnect from "@/app/config/database";

export async function GET(request: NextRequest) {
    try {
        await dbConnect();
        const authToken = request.cookies.get('authToken')?.value || '';
        const authObject = await verifyToken(authToken);
        const userId = authObject.userId;


        const purchaseList = await PurchasedProduct.findOne({ userId: userId });

        if(purchaseList){
            const pendingReviewList = purchaseList.purchasedList.filter((item:any)=>item.reviewed===false);
            return NextResponse.json({success:true,message:'Purchased list fetched successfully',content:pendingReviewList});
        }else{
            return NextResponse.json({success:false,message:'No items found'});
        }
    } catch (error) {
        console.log(error);
        return NextResponse.json({success:false,message:'Some server error occurred!'});
    }

}