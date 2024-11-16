import { verifyToken } from "@/app/api/authenticate/functions/auth";
import dbConnect from "@/app/config/database";
import ProductReview from "@/app/models/product_review";
import { NextRequest, NextResponse } from "next/server";

interface Params {
    params: {
        id: Number
    }
}

export async function GET(request: NextRequest, { params }: Params) {
    try {
        await dbConnect();
        const { id } = params;
        const productId = id;

        const productReviews = await ProductReview.findOne({ productId: productId });
        const responseObj = {
            productReviews: productReviews.comments
        }
        return NextResponse.json({ success: true, message: 'Comments fetched', content: responseObj });

    } catch (error) {
        console.log(error)
        return NextResponse.json({ success: false, message: 'Some server error occurred!' });
    }
}