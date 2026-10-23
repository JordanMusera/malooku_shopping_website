import { NextResponse } from 'next/server';
import dbConnect from '@/app/config/database';
import Product from '@/app/models/product';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await dbConnect();
    const products = await Product.find();
    return NextResponse.json(products);
  } catch (error) {
    console.error('Failed to load products:', error);
    return NextResponse.json({ message: 'Unable to load products.' }, { status: 503 });
  }
}