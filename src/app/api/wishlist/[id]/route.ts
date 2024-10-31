import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "../../authenticate/functions/auth";
import Wishlist from "@/app/models/wishlist";
import dbConnect from "@/app/config/database";
import { Params } from "next/dist/shared/lib/router/utils/route-matcher";

export async function DELETE(request:NextRequest,{params}:Params){
    await dbConnect();

    try {
    const {id} = params;
    const userToken = request.cookies.get('authToken')?.value || '';
    const tokenObject = await verifyToken(userToken);
    const userId = tokenObject.userId;


    const wishlist = await Wishlist.findOneAndUpdate(
        {userId:userId},
        {$pull:{wishlist:{
            productId:id
        }}},
        {new:true}
    )

    return NextResponse.json({success:true,message:'wishlist deleted successfully'});

    } catch (error) {
         return NextResponse.json({success:false,message:'Some server error occurred'});
    }
    
    
}