import dbConnect from '@/app/config/database';
import { NextRequest, NextResponse } from 'next/server';
import User from '@/app/models/user';
import { verifyToken } from '../authenticate/functions/auth';

export const dynamic = 'force-dynamic';

const reply = (body: object, status = 200) => NextResponse.json(body, {
  status,
  headers: { 'Cache-Control': 'private, no-store' },
});

async function getSession(request: NextRequest) {
  const token = request.cookies.get('authToken')?.value;
  if (!token) return null;
  try {
    const session = await verifyToken(token);
    return typeof session.userId === 'string' && /^[a-f0-9]{24}$/i.test(session.userId) ? session : null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const session = await getSession(request);
  if (!session) return reply({ success: false, message: 'Please sign in to continue.' }, 401);
  try {
    await dbConnect();
    const user = await User.findById(session.userId).select('-password');
    if (!user) return reply({ success: false, message: 'Account not found. Please sign in again.' }, 404);
    return reply({ success: true, user });
  } catch {
    return reply({ success: false, message: 'Account details are temporarily unavailable. Please try again shortly.' }, 503);
  }
}

export async function POST(request: NextRequest) {
  const session = await getSession(request);
  if (!session) return reply({ success: false, message: 'Please sign in to continue.' }, 401);
  let body;
  try { body = await request.json(); } catch {
    return reply({ success: false, message: 'Please provide valid account details.' }, 400);
  }
  const { county, city, street, fullName, email, phone } = body || {};
  if (typeof fullName !== 'string' || !fullName.trim() || typeof email !== 'string' || !email.trim()) {
    return reply({ success: false, message: 'Your name and email are required.' }, 400);
  }
  try {
    await dbConnect();
    const user = await User.findByIdAndUpdate(session.userId, {
      address: { county, city, street }, fullname: fullName, email, phone,
    }, { new: true }).select('-password');
    if (!user) return reply({ success: false, message: 'Account not found. Please sign in again.' }, 404);
    return reply({ success: true, user });
  } catch {
    return reply({ success: false, message: 'Unable to save account details right now. Please try again shortly.' }, 503);
  }
}
