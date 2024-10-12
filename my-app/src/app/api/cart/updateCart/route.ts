import dbConnect from "@/app/config/database";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "../../authenticate/functions/auth";
import Cart from "@/app/models/cart";

export async function POST(request: NextRequest) {
    await dbConnect();
    try {
        const authToken = request.cookies.get('authToken')?.value || '';
        const authObject = await verifyToken(authToken);
        const userId = authObject.userId;

        const {cart} = await request.json();

        const newCart = await Cart.findOne({userId:userId});
        newCart.products = cart;

        console.log("NEW CART: "+newCart);

        await newCart.save();

        if(newCart){
            return NextResponse.json({success:true,message:'Cart Updated',content:newCart})
        }
    } catch (error) {
        return NextResponse.json({success:false,message:error});
    }

}
