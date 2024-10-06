import dbConnect from "@/app/config/database";
import Cart from "@/app/models/cart";
import Product from "@/app/models/product";
import { NextResponse } from "next/server";

interface Params{
    params:{
        id:String
    }
}

export async function GET(_request:Request,{params}:Params){
    await dbConnect();

    const {id} = params;

    const cart = await Cart.findOne({userId:id});
    const cartProductIds = cart.products;

    const productsData = [];
    let totalCost = 0;

    for(let i=0;i<cartProductIds.length;i++){
        const productId = cartProductIds[i].productId;
        const productQty = cartProductIds[i].quantity;

        const product = await Product.findOne({id:productId});
        const totalProductsPrice = product.price*productQty;
        totalCost += totalProductsPrice;

        const newProductDetails={
            ...product.toObject(),
            orderedQty:productQty,
            productQtyPrice:totalProductsPrice
        };

        productsData.push(newProductDetails);
    }

    console.log("$"+totalCost);

    const resData = {
        cartData:productsData,
        totalCartCost:totalCost
    }

    return NextResponse.json(resData);
}

export async function POST(request:Request,response:Response){
    
}