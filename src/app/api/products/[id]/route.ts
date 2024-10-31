import dbConnect from "@/app/config/database";
import Product from "@/app/models/product";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "../../authenticate/functions/auth";
import Wishlist from "@/app/models/wishlist";


interface Params{
    params:{
        id:Number
    }
}

export async function GET(request:NextRequest,{params}:Params){
    await dbConnect();

    const {id} = params;
    const product = await Product.findById(id);

    const authToken = request.cookies.get('authToken')?.value||null;

    if(authToken){
        const authObject = await verifyToken(authToken);
        const userId = authObject.userId;

        const wishlist = await Wishlist.findOne({userId:userId});

        const matchFound = wishlist.wishlist.some((wishlist: { productId: any; })=>wishlist.productId===product._id.toString());
        console.log("MATCH: "+matchFound);

        if(matchFound){
         
    const productObj = product.toObject();

    const productWithWish = {
        ...productObj,
        wish:true,
    };

            return NextResponse.json(productWithWish);
        
        }

        console.log(product)
        return NextResponse.json(product);
       
    }
    //return NextResponse.json(product);
}