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

export async function GET(request: NextRequest) {
    const headers = { 'Cache-Control': 'private, no-store' };
    const token = request.cookies.get('authToken')?.value;
    const session = token ? await verifyToken(token).catch(() => null) : null;
    if (!session) {
        return NextResponse.json(
            { success: false, message: 'Sign in to view your bag.' },
            { status: 401, headers }
        );
    }

    try {
        await dbConnect();
        const cart = await Cart.findOne({ userId: session.userId });
        const productsData = [];
        let totalCost = 0;
        for (const item of cart?.products ?? []) {
            const product = await Product.findById(item.productId);
            if (!product) continue;
            const totalProductsPrice = product.price * item.quantity;
            totalCost += totalProductsPrice;
            productsData.push({
                ...product.toObject(),
                orderedQty: item.quantity,
                productQtyPrice: totalProductsPrice,
            });
        }
        return NextResponse.json(
            { cartData: productsData, totalCartCost: totalCost },
            { headers }
        );
    } catch (error) {
        console.error('Unable to load cart:', error);
        return NextResponse.json(
            { success: false, message: 'Unable to load your bag. Please try again.' },
            { status: 500, headers }
        );
    }
}
export async function POST(request:NextRequest){
 const token=request.cookies.get('authToken')?.value;
 const session=token?await verifyToken(token).catch(()=>null):null;
 if(!session)return NextResponse.json({success:false,message:'Sign in to add items to your bag.'},{status:401});
 try {
  await dbConnect();const {productId,orderedQty,selectedProductVariants}=await request.json();
  if(typeof productId!=='string' || !/^[a-f0-9]{24}$/i.test(productId) || !Number.isInteger(orderedQty) || orderedQty<1 || orderedQty>99)return NextResponse.json({success:false,message:'Choose a valid product and quantity.'},{status:400});
  if(!await Product.exists({_id:productId}))return NextResponse.json({success:false,message:'This product is no longer available.'},{status:404});
  let cart=await Cart.findOne({userId:session.userId});
  if(!cart)cart=new Cart({userId:session.userId,products:[],date:new Date()});
  const existing=cart.products.find((item:any)=>item.productId===productId);
  if(existing)existing.quantity+=orderedQty;else cart.products.push({productId,quantity:orderedQty,selectedProductVariants:selectedProductVariants||{}});
  await cart.save();
  const response=await GET(request);if(!response.ok)return response;
  return NextResponse.json({success:true,message:'Added to your bag',...await response.json()},{headers:{'Cache-Control':'no-store'}});
 }catch{return NextResponse.json({success:false,message:'Unable to add this item. Please try again.'},{status:500});}
}
