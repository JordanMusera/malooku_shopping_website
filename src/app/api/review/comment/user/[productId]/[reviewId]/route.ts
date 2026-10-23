import { verifyToken } from '@/app/api/authenticate/functions/auth';
import dbConnect from '@/app/config/database';
import ProductReview from '@/app/models/product_review';
import PurchasedProduct from '@/app/models/purchased_product';
import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';
const reply = (body: object, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'private, no-store' } });
export async function DELETE(request: NextRequest, { params }: { params: { productId: string; reviewId: string } }) {
  let userId: string;
  try { userId = (await verifyToken(request.cookies.get('authToken')?.value || '')).userId; if (!userId) throw new Error(); }
  catch { return reply({ success: false, message: 'Sign in to manage your reviews.' }, 401); }
  const { productId, reviewId } = params;
  if (!mongoose.isValidObjectId(productId) || !mongoose.isValidObjectId(reviewId)) return reply({ success: false, message: 'Invalid review reference.' }, 400);
  try {
    await dbConnect();
    const reviews = await ProductReview.findOneAndUpdate({ productId, comments: { $elemMatch: { _id: reviewId, userId } } }, { $pull: { comments: { _id: reviewId, userId } } }, { new: true });
    if (!reviews) return reply({ success: false, message: 'Review not found.' }, 404);
    const remaining = reviews.comments.filter((item: { userId: string }) => item.userId === userId);
    await PurchasedProduct.updateOne({ userId }, { $set: { 'purchasedList.$[item].reviewed': remaining.length > 0 } }, { arrayFilters: [{ 'item.productId': productId }] });
    return reply({ success: true, message: 'Review deleted.', content: remaining });
  } catch { return reply({ success: false, message: 'Unable to delete your review. Please try again.' }, 503); }
}
