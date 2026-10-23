import dbConnect from "@/app/config/database";
import ProductReview from "@/app/models/product_review";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  if (!mongoose.isValidObjectId(params.id)) {
    return NextResponse.json({ success: false, message: "Product not found." }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }
  try {
    await dbConnect();
    const productReviews = await ProductReview.findOne({ productId: params.id }).lean() as { comments?: unknown[] } | null;
    return NextResponse.json({
      success: true,
      message: "Product reviews loaded.",
      content: { productReviews: Array.isArray(productReviews?.comments) ? productReviews.comments : [] },
    }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ success: false, message: "Customer reviews are temporarily unavailable." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
