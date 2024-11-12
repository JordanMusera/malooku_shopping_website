import dbConnect from "@/app/config/database";
import Product from "@/app/models/product";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request:NextRequest){
    try {
        await dbConnect();
        const products = await Product.find({});

        if(products){
            return NextResponse.json({success:true,message:'Products fetched successfully',content:products});
        }else{
            return NextResponse.json({success:false,message:'No products were found!'});
        }
    } catch (error) {
        return NextResponse.json({success:false,message:'Some server error occurred!'});
    }
}