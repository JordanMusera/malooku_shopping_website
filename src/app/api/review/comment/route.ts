import dbConnect from "@/app/config/database";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "../../authenticate/functions/auth";
import User from "@/app/models/user";
import ProductReview from "@/app/models/product_review";
import PurchasedProduct from "@/app/models/purchased_product";

export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        const { productId, comment } = await request.json();

        const authToken = request.cookies.get('authToken')?.value || '';
        const authObj = await verifyToken(authToken);
        const userId = authObj.userId;

        const user = await User.findById(userId);
        const userPurchased = await PurchasedProduct.findOne({ userId: userId });

        if (user && userPurchased) {
            const productReviews = await ProductReview.findOne({ productId: productId });
            if (productReviews) {
                const commentAvailable = productReviews.comments.some((item: { userId: string })=>item.userId===userId);
                if(commentAvailable){
                    return NextResponse.json({success:false,message:'You Already Provided a Review'})
                }
                productReviews.comments.push({
                    userName: user.username,
                    userId: userId,
                    comment: comment
                });

                await productReviews.save();
                return NextResponse.json({ success: false, message: 'Review posted', content: productReviews });
            } else {
                const productReview = new ProductReview({
                    productId: productId,
                    comments: [
                        {
                            userName: user.username,
                            userId: userId,
                            comment: comment
                        }
                    ]

                });
                await productReview.save();
                return NextResponse.json({ success: false, message: 'Review posted', content: productReview });
            }
        } else {
            return NextResponse.json({ success: false, message: 'User not authenticated!' });
        }
    } catch (error) {

    }
}

