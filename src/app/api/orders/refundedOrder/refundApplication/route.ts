import dbConnect from "@/app/config/database";
import { verifyToken } from "@/app/api/authenticate/functions/auth";
import { CloudinaryUploadError, deleteCloudinaryImages, readImageBuffers, uploadMultipleToCloudinary } from "@/app/api/authenticate/functions/cloudinary";
import Order from "@/app/models/order";
import RefundOrder from "@/app/models/refund_order";
import User from "@/app/models/user";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

const reply = (body: object, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'private, no-store' } });

export async function POST(request: NextRequest) {
  let uploaded: Awaited<ReturnType<typeof uploadMultipleToCloudinary>> = [];
  try {
    let userId: string;
    try {
      const userObj = await verifyToken(request.cookies.get('authToken')?.value || '');
      if (!userObj?.userId) throw new Error('missing user');
      userId = String(userObj.userId);
    } catch {
      return reply({ success: false, message: 'Sign in to request a refund.' }, 401);
    }

    await dbConnect();
    const data = await request.formData();
    const orderId = String(data.get('orderId') || '').trim();
    const productId = String(data.get('productId') || '').trim();
    const selectedReason = String(data.get('selectedReason') || '').trim();
    const providedReason = String(data.get('providedReason') || '').trim();
    if (!mongoose.isValidObjectId(orderId) || !mongoose.isValidObjectId(productId)) return reply({ success: false, message: 'A valid order and product are required.' }, 400);
    if (!selectedReason || selectedReason.length > 160 || providedReason.length > 1000) return reply({ success: false, message: 'Select a refund reason and keep additional details under 1,000 characters.' }, 400);

    const [user, order] = await Promise.all([User.findById(userId).select('_id'), Order.findOne({ userId, _id: orderId })]);
    if (!user) return reply({ success: false, message: 'Your account could not be found.' }, 401);
    if (!order) return reply({ success: false, message: 'Order not found.' }, 404);
    const orderProduct = order.products.find((item: { product: { _id: { toString: () => string } } }) => item.product?._id?.toString() === productId);
    if (!orderProduct) return reply({ success: false, message: 'Product not found in this order.' }, 404);

    const buffers = await readImageBuffers(data);
    uploaded = await uploadMultipleToCloudinary(buffers, `malooku/refunds/${userId}`);
    const application = new RefundOrder({
      userId, orderId, productId, order: orderProduct, selectedReason, providedReason,
      messages: [{ message: 'Refund requested by user' }, { message: 'Request is being processed' }],
      images: uploaded.map((image) => ({ url: image.secure_url, publicId: image.public_id, assetId: image.asset_id })),
    });
    await application.save();

    const productIndex = order.products.findIndex((item: { product: { _id: { toString: () => string } } }) => item.product?._id?.toString() === productId);
    if (productIndex !== -1) {
      if (order.products.length === 1) await Order.findOneAndDelete({ userId, _id: orderId });
      else {
        order.products.splice(productIndex, 1);
        order.totalCost = order.products.reduce((sum: number, item: { productQtyPrice?: number }) => sum + (item.productQtyPrice || 0), 0);
        await order.save();
      }
    }
    uploaded = [];
    return reply({ success: true, message: 'Application submitted.', content: application }, 201);
  } catch (error) {
    await deleteCloudinaryImages(uploaded.map((image) => image.public_id));
    const status = error instanceof CloudinaryUploadError ? error.status : 503;
    const message = error instanceof CloudinaryUploadError ? error.message : 'Unable to submit the refund request right now.';
    return reply({ success: false, message }, status);
  }
}
