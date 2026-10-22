import {NextResponse} from 'next/server';import {paymentSettings} from '../../authenticate/functions/mpesa';
export const dynamic='force-dynamic';
export function GET(){try{return NextResponse.json(paymentSettings(),{headers:{'Cache-Control':'no-store'}});}catch{return NextResponse.json({message:'Payment configuration is unavailable.'},{status:503});}}
