import {receivePaymentCallback} from '@/app/lib/payment-callback';
import {NextRequest} from 'next/server';
export const runtime='nodejs';
export const maxDuration=60;
export function POST(request:NextRequest,context:{params:{paymentId:string;token:string}}){return receivePaymentCallback(request,context.params);}
