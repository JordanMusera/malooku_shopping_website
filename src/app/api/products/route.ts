import { NextResponse } from 'next/server';
import dbConnect from '@/app/config/database';
import Product from '@/app/models/product';

export async function GET() {

  await dbConnect();
  const products = await Product.find();
  
  return NextResponse.json(products);
}
 