import dbConnect from "@/app/config/database";
import Product from "@/app/models/product";
import { Params } from "next/dist/shared/lib/router/utils/route-matcher";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request:NextRequest, {params}:Params){
    await dbConnect;
    
    const { search } = params;
    const products = await Product.find({title:{$regex:search,$options:'i'}});

    return NextResponse.json(products);
}