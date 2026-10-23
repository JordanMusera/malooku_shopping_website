import { requireAdmin } from '@/app/lib/admin-auth';
import { orderStatusDescriptions, OrderStatus } from '@/app/lib/order-tracking';
import dbConnect from '@/app/config/database';
import Order from '@/app/models/order';
import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';

const reply = (body: object, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'private, no-store' } });
export async function GET(request: NextRequest) {
  try {
    const denied = await requireAdmin(request); if (denied) return denied;
    await dbConnect();
    return reply({ success: true, content: await Order.find({}) });
  } catch { return reply({ success: false, message: 'Unable to load orders. Please try again.' }, 503); }
}
export async function POST(request: NextRequest) {
  try {
    const denied = await requireAdmin(request); if (denied) return denied;
    let body;
    try { body = await request.json(); } catch { return reply({ success: false, message: 'Provide valid order details.' }, 400); }
    const { orderId, orderStatus } = body || {};
    if (typeof orderId !== 'string' || !mongoose.isValidObjectId(orderId) || typeof orderStatus !== 'string' || !Object.hasOwn(orderStatusDescriptions, orderStatus)) {
      return reply({ success: false, message: 'Select a valid order and status.' }, 400);
    }
    await dbConnect();
    const status = orderStatus as OrderStatus;
    // Save the status and its history event together. Repeated submissions of
    // the same status must not create duplicate tracking events.
    const updated = await Order.findOneAndUpdate({ _id: orderId, status: { $ne: status } }, {
      $set: { status },
      $push: { statusHistory: { orderStatus: status, date: new Date().toISOString(), description: orderStatusDescriptions[status] } },
    }, { new: true, runValidators: true });
    const order = updated || await Order.findById(orderId);
    if (!order) return reply({ success: false, message: 'Order not found.' }, 404);
    return reply({ success: true, message: 'Status updated successfully.', content: order });
  } catch { return reply({ success: false, message: 'Unable to save the status. Please try again.' }, 503); }
}
