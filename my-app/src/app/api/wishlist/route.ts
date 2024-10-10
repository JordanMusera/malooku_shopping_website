import { Params } from "next/dist/shared/lib/router/utils/route-matcher";
import { NextRequest, NextResponse } from "next/server";
import Wishlist from "@/app/models/wishlist";
import { verifyToken } from "../authenticate/functions/auth";
import Product from "@/app/models/product";
import dbConnect from "@/app/config/database";


export async function POST(request: NextRequest) {
    await dbConnect();
    const {id} = await request.json();

    try {
        const userToken = request.cookies.get('authToken')?.value || '';
        const tokenObject = await verifyToken(userToken);
        const userId = tokenObject.userId;

        const productExists = await Product.findById(id);
        if(!productExists){
            return NextResponse.json({success:false,message:'Product does not exist'})
        }

        const wishlist = await Wishlist.findOne({ userId: userId });
        console.log("WWWWWWW: "+wishlist)
        if (wishlist) {
            const wishlistItems = wishlist.wishlist;

            const itemexists = wishlistItems.some((item: { productId: string }) => item.productId === id);

            if (itemexists) {
                return NextResponse.json({ success: false, message: 'Item already exists in wishlist' })
            }

            wishlistItems.push({
                productId: id
            });

            wishlist.wishlist = wishlistItems;
            await wishlist.save();

            console.log("UPDATED_WISHLIST: " + wishlist);

            return NextResponse.json({ success: true, message: 'Item added to wishlist', content: wishlist })
        } else {
            const newWishlist = new Wishlist({
                userId,
                wishlist: [
                    {
                        productId: id,
                    },
                ],
            });

            await newWishlist.save();

            return NextResponse.json({ success: true, message: 'Item added to wishlist' });
        }
    } catch (error) {
        return NextResponse.json({ success: false, message: 'Some server error occurred' });
    }


}


export async function GET(request:NextRequest){
    await dbConnect();

    const authToken = request.cookies.get('authToken')?.value||'';
    const tokenObject = await verifyToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyRW1haWwiOiJqb2RvQGdtYWlsLmNvbSIsInVzZXJJZCI6IjY3MDQwZDMwNDFkNGNmOGZjNDQ2YWI4YyIsImlhdCI6MTcyODQ5OTA0MSwiZXhwIjoxNzI5Nzk1MDQxfQ.wkU_CnBvONur4KOGCpfz8Yu4WHbnGDOWCHfspJHMtKY');
    const userId = tokenObject.userId;

    const wishlist = await Wishlist.findOne({userId:userId});

    if(wishlist){
        let wishlistObject = [];
        for(let i=0;i<wishlist.wishlist.length;i++){
            const product = await Product.findById(wishlist.wishlist[i].productId);
            const finalProduct = product;

            if(product){
              wishlistObject.push(finalProduct)  
            }
        }

        return NextResponse.json({success:true,message:"wishlist retrived",wishlist:wishlistObject});
    }else{
        return NextResponse.json({success:false,message:'Wishlist is empty'})
    }
}
