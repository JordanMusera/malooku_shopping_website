import dbConnect from "@/app/config/database";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "../../../authenticate/functions/auth";
import User from "@/app/models/user";
import Product from "@/app/models/product";
import ProductReview from "@/app/models/product_review";
import PurchasedProduct from "@/app/models/purchased_product";
import mongoose from "mongoose";
import { CloudinaryUploadError, deleteCloudinaryImages, readImageBuffers, uploadMultipleToCloudinary } from "@/app/api/authenticate/functions/cloudinary";

const reply = (body: object, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'private, no-store' } });

export async function POST(request: NextRequest) {
  let uploaded: Awaited<ReturnType<typeof uploadMultipleToCloudinary>> = [];
  try {
    let userId: string;
    try {
      const auth = await verifyToken(request.cookies.get('authToken')?.value || '');
      if (!auth?.userId) throw new Error('missing user');
      userId = String(auth.userId);
    } catch {
      return reply({ success: false, message: 'Sign in to post a review.' }, 401);
    }

    await dbConnect();
    const data = await request.formData();
    const productId = String(data.get('productId') || '').trim();
    const comment = String(data.get('review') || '').trim();
    const rating = Number(data.get('rating'));
    if (!mongoose.isValidObjectId(productId)) return reply({ success: false, message: 'Select a valid product to review.' }, 400);
    if (!comment || comment.length > 2000) return reply({ success: false, message: 'A review is required and must be under 2,000 characters.' }, 400);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) return reply({ success: false, message: 'Choose a rating from 1 to 5.' }, 400);

    const [user, product, purchase] = await Promise.all([
      User.findById(userId),
      Product.findById(productId).select('_id'),
      PurchasedProduct.findOne({ userId, purchasedList: { $elemMatch: { productId, status: { $ne: 'refunded' } } } }),
    ]);
    if (!user) return reply({ success: false, message: 'Your account could not be found.' }, 401);
    if (!product) return reply({ success: false, message: 'Product not found.' }, 404);
    if (!purchase) return reply({ success: false, message: 'You can review products from your purchases.' }, 403);
    const existingReview = await ProductReview.findOne({ productId, 'comments.userId': userId }).select('_id');
    if (existingReview) return reply({ success: false, message: 'You have already reviewed this product.' }, 409);

    const buffers = await readImageBuffers(data);
    uploaded = await uploadMultipleToCloudinary(buffers, `malooku/reviews/${userId}`);
    const reviewData = {
      userName: user.username,
      userId,
      comment,
      rating,
      images: uploaded.map((image) => ({ imageUrl: image.secure_url, publicId: image.public_id, assetId: image.asset_id })),
    };
    let reviews = await ProductReview.findOne({ productId });
    if (reviews) {
      reviews.comments.push(reviewData);
    } else {
      reviews = new ProductReview({ productId, comments: [reviewData] });
    }
    await reviews.save();
    uploaded = [];
    await PurchasedProduct.updateOne(
      { userId, 'purchasedList.productId': productId },
      { $set: { 'purchasedList.$[item].reviewed': true } },
      { arrayFilters: [{ 'item.productId': productId }] },
    ).catch(() => undefined);
    return reply({ success: true, message: 'Review posted', content: reviews }, 201);
  } catch (error) {
    await deleteCloudinaryImages(uploaded.map((image) => image.public_id));
    const status = error instanceof CloudinaryUploadError ? error.status : 503;
    const message = error instanceof CloudinaryUploadError ? error.message : 'Unable to post your review right now.';
    return reply({ success: false, message }, status);
  }
}
