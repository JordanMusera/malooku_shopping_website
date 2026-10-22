export const runtime='nodejs';
export const maxDuration=60;
import {NextRequest,NextResponse} from 'next/server';import dbConnect from '@/app/config/database';import PaymentAttempt from '@/app/models/payment_attempt';import {checkPayment} from '@/app/lib/checkout-payment';
export async function POST(request:NextRequest){try{const body=await request.json();const id=body?.Body?.stkCallback?.CheckoutRequestID;if(typeof id!=='string')return NextResponse.json({ResultCode:1,ResultDesc:'Invalid callback'},{status:400});await dbConnect();const attempt=await PaymentAttempt.findOne({checkoutId:id});if(attempt)await checkPayment(attempt);return NextResponse.json({ResultCode:0,ResultDesc:'Accepted'});}catch{return NextResponse.json({ResultCode:1,ResultDesc:'Confirmation unavailable'},{status:503});}}
