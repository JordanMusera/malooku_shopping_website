import { verifyToken } from '@/app/api/authenticate/functions/auth';
import dbConnect from '@/app/config/database';
import { trackingForOrder } from '@/app/lib/order-tracking';
import Order from '@/app/models/order';
import OrderProgress from '@/app/models/orderprogress';
import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
const reply = (body: object, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'private, no-store' } });
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  let userId: string;
  try {
    const token = request.cookies.get('authToken')?.value;
    if (!token) throw new Error('No session');
    userId = (await verifyToken(token)).userId;
    if (!userId) throw new Error('Invalid session');
  } catch { return reply({ success: false, message: 'Sign in to view your order.' }, 401); }
  if (!mongoose.isValidObjectId(params.id)) return reply({ success: false, message: 'Invalid order reference.' }, 400);
  try {
    await dbConnect();
    const order = await Order.findOne({ _id: params.id, userId }).lean();
    if (!order) return reply({ success: false, message: 'Order not found.' }, 404);
    const legacy = await OrderProgress.findOne({ orderId: params.id }).lean();
    return reply({ success: true, content: trackingForOrder(order as any, legacy as any) });
  } catch { return reply({ success: false, message: 'Unable to load tracking. Please try again.' }, 503); }
}
