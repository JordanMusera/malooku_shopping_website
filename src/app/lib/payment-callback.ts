import {createHash,timingSafeEqual} from 'node:crypto';
import mongoose from 'mongoose';
import {NextRequest,NextResponse} from 'next/server';
import dbConnect from '@/app/config/database';
import PaymentAttempt from '@/app/models/payment_attempt';
import {checkPayment} from './checkout-payment';
import {isProcessingResult,normalizePhone} from '@/app/api/authenticate/functions/mpesa';

const reply=(body:any,status=200)=>NextResponse.json(body,{status,headers:{'Cache-Control':'no-store'}});
export async function receivePaymentCallback(request:NextRequest,reference?:{paymentId:string;token:string}){
 try{
  const callback=(await request.json())?.Body?.stkCallback;
  if(typeof callback?.CheckoutRequestID!=='string' || callback.CheckoutRequestID.length>200)return reply({ResultCode:1,ResultDesc:'Invalid callback'},400);
  await dbConnect();
  // Old requests without a private callback URL still require a provider lookup.
  if(!reference){
   const attempt=await PaymentAttempt.findOne({checkoutId:callback.CheckoutRequestID});
   if(!attempt)return reply({ResultCode:1,ResultDesc:'Unknown payment'},404);
   await PaymentAttempt.updateOne({_id:attempt._id},{$set:{legacyCallbackReceivedAt:new Date()}});
   await checkPayment(attempt);
   return reply({ResultCode:0,ResultDesc:'Accepted'});
  }
  if(!mongoose.isValidObjectId(reference.paymentId)||!/^\w{64}$/.test(reference.token))return reply({ResultCode:1,ResultDesc:'Invalid callback reference'},403);
  const attempt=await PaymentAttempt.findById(reference.paymentId);
  const expected=attempt?.callbackTokenHash;
  const actual=createHash('sha256').update(reference.token).digest('hex');
  if(typeof expected!=='string'||!/^[a-f0-9]{64}$/.test(expected)||!timingSafeEqual(Buffer.from(expected,'hex'),Buffer.from(actual,'hex')))return reply({ResultCode:1,ResultDesc:'Invalid callback reference'},403);
  if(attempt.checkoutId && attempt.checkoutId!==callback.CheckoutRequestID)return reply({ResultCode:1,ResultDesc:'Payment reference mismatch'},400);
  if(attempt.merchantRequestId && attempt.merchantRequestId!==callback.MerchantRequestID)return reply({ResultCode:1,ResultDesc:'Merchant reference mismatch'},400);
  const code=String(callback.ResultCode);
  if(!/^\d+$/.test(code)||typeof callback.ResultDesc!=='string')return reply({ResultCode:1,ResultDesc:'Invalid payment result'},400);
  let confirmation:any={state:code==='0'?'paid':isProcessingResult(code,callback.ResultDesc)?'pending':'failed',code,message:callback.ResultDesc,source:'callback'};
  if(code==='0'){
   const items=callback.CallbackMetadata?.Item;
   if(!Array.isArray(items))return reply({ResultCode:1,ResultDesc:'Missing payment details'},400);
   const value=(name:string)=>items.find((item:any)=>item?.Name===name)?.Value;
   const amount=value('Amount'),receipt=value('MpesaReceiptNumber'),phone=value('PhoneNumber');
   if(amount===undefined || amount===null || String(amount).trim()==='' || !Number.isFinite(Number(amount)) || Number(amount)!==attempt.amount)return reply({ResultCode:1,ResultDesc:'Payment amount mismatch'},400);
   if(typeof receipt!=='string'||!/^[A-Za-z0-9]{6,64}$/.test(receipt))return reply({ResultCode:1,ResultDesc:'Invalid payment receipt'},400);
   let matches=false;try{matches=normalizePhone(phone)===normalizePhone(attempt.order.paymentMethod.accNumber);}catch{}
   if(!matches)return reply({ResultCode:1,ResultDesc:'Payment phone mismatch'},400);
   confirmation={...confirmation,amount:Number(amount),receiptNumber:receipt,transactionDate:String(value('TransactionDate')||'')};
  }
  // Save before finalization: any poll can resume after an interruption.
  // The callback can arrive before the STK submission response has been saved.
  await PaymentAttempt.updateOne({_id:attempt._id,$and:[{$or:[{checkoutId:{$exists:false}},{checkoutId:callback.CheckoutRequestID}]},{$or:[{'confirmation.state':{$ne:'paid'}},...(code==='0'?[{'confirmation.source':'query','confirmation.receiptNumber':{$exists:false}}]:[])]}]},
   {$set:{checkoutId:callback.CheckoutRequestID,confirmation,callbackReceivedAt:new Date()}});
  if(confirmation.state!=='pending')await checkPayment(await PaymentAttempt.findById(attempt._id));
  return reply({ResultCode:0,ResultDesc:'Accepted'});
 }catch(error){
  console.error('mpesa_callback_error',{type:error instanceof Error?error.name:'Error'});
  return reply({ResultCode:1,ResultDesc:'Confirmation unavailable'},503);
 }
}
