import dbConnect from "@/app/config/database";
import Product from "@/app/models/product";
import { NextResponse } from "next/server";

interface Params{
    params:{
        id:Number
    }
}

export async function GET(request:Request,{params}:Params){
    await dbConnect();

    const {id} = params;
    const product = await Product.findById(id);
    return NextResponse.json(product);
}