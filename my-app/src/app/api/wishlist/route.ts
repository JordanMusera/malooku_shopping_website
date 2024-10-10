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