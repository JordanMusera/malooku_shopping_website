import dbConnect from "@/app/config/database";
import Cart from "@/app/models/cart";
import Product from "@/app/models/product";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/app/api/authenticate/functions/auth";

interface Params{
    params:{
        id:String
    }
}

interface ProductItem{
    productId:string,
    quantity:number
}

export async function GET(request:NextRequest,{params}:Params){
    await dbConnect();

    //const {id} = params;
    const userToken = request.cookies.get('authToken')?.value||'';
    if(!userToken){
        return NextResponse.json({success:false,message:'Sign in to continue'})
    }
    const tokenObject = await verifyToken(userToken);
    const userId = tokenObject.userId;

    console.log('TOKEN_VALIDITY:'+ userId);

    const cart = await Cart.findOne({userId:userId});
    const cartProductIds = cart.products;

    const productsData = [];
    let totalCost = 0;

    for(let i=0;i<cartProductIds.length;i++){
        const productId = cartProductIds[i].productId;
        const productQty = cartProductIds[i].quantity;

        const product = await Product.findOne({_id:productId});
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

export async function POST(request:NextRequest){
    await dbConnect();
    //const {id} = params;
    const {productId,orderedQty} = await request.json();

    const userToken = request.cookies.get('authToken')?.value||'';

    if(!userToken){
        return NextResponse.json({success:false,message:'Sign in to continue'})
    }
    const decodedToken = await verifyToken(userToken);
    const userId = decodedToken.userId;
    console.log("IDD: "+userId);

    const cart = await Cart.findOne({userId:userId});

    if(cart){
        const productIndex = cart.products.findIndex((product: ProductItem) => product.productId === productId);
        
        if(productIndex!==-1){
            return NextResponse.json({"success":false,"message":"Product already in cart"})
        }
        

        cart.products.push({ productId:productId, quantity: orderedQty });
        console.log(cart)

        await cart.save();
        return NextResponse.json({"success":true,"message":"Product added to cart"})
        
    }else{
         const newCart = new Cart({
            userId: userId,
            products: [{ productId, quantity: orderedQty }],
            date: new Date()
        });

        try {
            await newCart.save();
            return NextResponse.json({ success: true, message: "Cart created successfully" });
        } catch (error) {
            console.error("Error creating cart:", error);
            return NextResponse.json({ success: false, message: "Error creating cart" }, { status: 500 });
        }
    }

   
}