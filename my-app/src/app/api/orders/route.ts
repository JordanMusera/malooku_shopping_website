import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/app/config/database";
import { verifyToken } from "../authenticate/functions/auth";
import Cart from "@/app/models/cart";
import Product from "@/app/models/product";
import Order from "@/app/models/order";

export async function POST(request:NextRequest){
    await dbConnect();

    const authToken = request.cookies.get('authToken')?.value||'';
    const authObject = await verifyToken(authToken);
    const userId = authObject.userId;

    const {shippingAddress,paymentMethod} = await request.json();

    const cart = await Cart.findOne({userId:userId});

    const cartProducts = [];
    let totalPrice = 0;
    if(cart.products){
        for(let i=0;i<cart.products.length;i++){
            let productQtyPrice = 0;
            const product = await Product.findById(cart.products[i].productId);
            if(product){
                productQtyPrice = product.price*cart.products[i].quantity;
                totalPrice += productQtyPrice;

                cartProducts.push({
                    product,
                    quantity:cart.products[i].quantity,
                    productQtyPrice:productQtyPrice
                })
            }
        }

        const orderObj={
            userId:userId,
            products:cartProducts,
            totalCost:totalPrice,
            shippingAddress:shippingAddress,
            paymentMethod:paymentMethod,
            deliveryInfo:{
                deliveryType:'pickup-station',
                pickupStation:'station1'
            }
        }

        const order = new Order(orderObj);
        await order.save();

        return NextResponse.json({success:true,content:order});
    }

    
}

export async function GET(request:NextRequest){
    const authToken = request.cookies.get('authToken')?.value||'';
    const authObject = await verifyToken(authToken);
    const userId = authObject.userId;

    const userOrders = await Order.find({userId:userId});

    if(userOrders){
        return NextResponse.json({success:true,message:'Orders fetched successfully',content:userOrders});
    }else{
        return NextResponse.json({success:false,message:'Failed to fetch orders',content:null});
    }
}