import { verifyToken } from '@/app/api/authenticate/functions/auth';
import dbConnect from '@/app/config/database';
import ProductReview from '@/app/models/product_review';
import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
const reply = (body: object, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'private, no-store' } });
export async function GET(request: NextRequest, { params }: { params: { productId: string } }) {
  let userId: string;
  try { userId = (await verifyToken(request.cookies.get('authToken')?.value || '')).userId; if (!userId) throw new Error(); }
  catch { return reply({ success: false, message: 'Sign in to view your reviews.' }, 401); }
  if (!mongoose.isValidObjectId(params.productId)) return reply({ success: false, message: 'Invalid product reference.' }, 400);
  try {
    await dbConnect();
    const reviews = await ProductReview.findOne({ productId: params.productId });
    return reply({ success: true, content: reviews?.comments.filter((item: { userId: string }) => item.userId === userId) || [] });
  } catch { return reply({ success: false, message: 'Unable to load your reviews. Please try again.' }, 503); }
}
