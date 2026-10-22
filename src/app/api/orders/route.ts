import {randomBytes,createHash} from 'node:crypto';
import {NextRequest,NextResponse} from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/app/config/database';
import {verifyToken} from '../authenticate/functions/auth';
import {MpesaError,mpesaConfig,normalizePhone,startMpesa,processingDescription} from '../authenticate/functions/mpesa';
import Cart from '@/app/models/cart';import Product from '@/app/models/product';import Order from '@/app/models/order';import PurchasedProduct from '@/app/models/purchased_product';import PaymentAttempt from '@/app/models/payment_attempt';import {checkPayment} from '@/app/lib/checkout-payment';
export const dynamic='force-dynamic';
export const runtime='nodejs';
export const maxDuration=60;
const reply=(body:any,status=200)=>NextResponse.json(body,{status,headers:{'Cache-Control':'private, no-store'}});
async function session(request:NextRequest){const token=request.cookies.get('authToken')?.value;return token?verifyToken(token).catch(()=>null):null;}
export async function POST(request:NextRequest){
 const auth=await session(request);if(!auth)return reply({success:false,message:'Sign in before paying.'},401);
 let attempt:any;
 const started=Date.now();let stage='database';
 const mark=(next:string)=>{console.info('checkout_stage',{stage,elapsedMs:Date.now()-started});stage=next;};
 try{
  await dbConnect();await PaymentAttempt.init();
  mark('find-existing-payment');
  let active=await PaymentAttempt.findOne({activeKey:auth.userId});
  if(!active){
   // Recover requests incorrectly marked failed by the old processing-code handler.
   const recoverable=await PaymentAttempt.findOne({userId:auth.userId,checkoutId:{$exists:true},$or:[{state:'pending'},{state:'failed',message:processingDescription}]}).sort({createdAt:-1});
   if(recoverable)active=await PaymentAttempt.findOneAndUpdate({_id:recoverable._id,state:{$in:['pending','failed']}},{$set:{state:'pending',activeKey:auth.userId}},{new:true});
  }
  if(active)return reply({success:false,pending:true,paymentId:String(active._id),message:'An existing payment is awaiting confirmation. Checking its status.'},202);
  const {shippingAddress,paymentMethod}=await request.json();
  if(!shippingAddress?.street?.trim()||!shippingAddress?.city?.trim()||!shippingAddress?.county?.trim()||paymentMethod?.accType!=='mpesa')return reply({success:false,message:'Select your delivery address and M-Pesa number first.'},400);
  const phone=normalizePhone(paymentMethod.accNumber);const config=mpesaConfig();
  mark('load-cart');
  const cart=await Cart.findOne({userId:auth.userId});if(!cart?.products?.length)return reply({success:false,message:'Your bag is empty.'},400);
  const products=[];let total=0;
  const available=await Product.find({_id:{$in:cart.products.map((line:any)=>line.productId)}}).lean();
  const byId=new Map(available.map((product:any)=>[String(product._id),product]));
  for(const line of cart.products){const product:any=byId.get(String(line.productId));if(!product || !Number.isInteger(line.quantity)||line.quantity<1) return reply({success:false,message:'Your bag contains an unavailable item. Please review it before paying.'},400);const cost=Number(product.price)*line.quantity;if(!Number.isFinite(cost)||cost<=0)throw new MpesaError('A product price is invalid. Please contact the store.');total+=cost;products.push({product,quantity:line.quantity,productQtyPrice:cost,status:'pending',purchaseId:new mongoose.Types.ObjectId()});}
  const history=await PurchasedProduct.findOne({userId:auth.userId}).select('_id');
  const amount=config.testAmount??Math.ceil(total);
  const callbackToken=randomBytes(32).toString('hex');
  const callbackTokenHash=createHash('sha256').update(callbackToken).digest('hex');
  mark('save-attempt');
  attempt=await PaymentAttempt.create({callbackTokenHash,userId:auth.userId,activeKey:auth.userId,amount,environment:config.environment,cartId:cart._id,cartProducts:cart.products.toObject(),order:{userId:auth.userId,products,totalCost:total,shippingAddress,paymentMethod:{...paymentMethod,accNumber:Number(phone)},deliveryInfo:{deliveryType:'pickup-station',pickupStation:'station1'},purchaseHistoryId:history?._id||new mongoose.Types.ObjectId()}});
  mark('mpesa-request');
  const callbackUrl=new URL(config.callback);callbackUrl.pathname='/api/payments/callback/'+attempt._id+'/'+callbackToken;callbackUrl.search='';callbackUrl.hash='';
  const submitted=await startMpesa(phone,amount,callbackUrl.toString());
  mark('save-checkout-reference');
  await PaymentAttempt.updateOne({_id:attempt._id,state:{$ne:'paid'},'confirmation.state':{$ne:'paid'}},{$set:{checkoutId:submitted.checkoutId,merchantRequestId:submitted.merchantRequestId,state:'pending'}});
  mark('respond');
  return reply({success:false,pending:true,paymentId:String(attempt._id),amount,message:'Payment request sent. Check your phone.'},202);
 }catch(error:any){
  console.error('checkout_error',{stage,elapsedMs:Date.now()-started,type:error?.name||'Error',code:error?.code});
  try{
  if(error?.code===11000){const active=await PaymentAttempt.findOne({activeKey:auth.userId});if(active)return reply({success:false,pending:true,paymentId:String(active._id),message:'Checking your existing payment.'},202);}
  const message=error instanceof MpesaError?error.message:'Unable to start payment. Please try again.';
  if(attempt){if(error instanceof MpesaError && !error.uncertain)await PaymentAttempt.updateOne({_id:attempt._id},{$set:{state:'failed',message},$unset:{activeKey:1}});else{await PaymentAttempt.updateOne({_id:attempt._id},{$set:{message:'Payment status is uncertain. Do not pay again; contact the store.'}});return reply({success:false,pending:true,paymentId:String(attempt._id),message:'Payment status is uncertain. Do not pay again; contact the store.'},202);}}
  return reply({success:false,message},502);
  }catch{
   // Database recovery may fail too; still return JSON instead of a framework error page.
   return reply({success:false,pending:!!attempt,paymentId:attempt?String(attempt._id):undefined,message:'Payment status is uncertain. Do not pay again; check its status shortly.'},503);
  }
 }
}
export async function GET(request:NextRequest){const auth=await session(request);if(!auth)return reply({success:false,message:'Sign in to continue.'},401);try{await dbConnect();if(request.nextUrl.searchParams.get('active')==='1'){const active=await PaymentAttempt.findOne({activeKey:auth.userId}).select('_id');return reply({success:true,pending:!!active,paymentId:active?String(active._id):undefined});}const paymentId=request.nextUrl.searchParams.get('paymentId');if(paymentId){if(!mongoose.isValidObjectId(paymentId))return reply({success:false,message:'Invalid payment reference.'},400);const attempt=await PaymentAttempt.findOne({_id:paymentId,userId:auth.userId});if(!attempt)return reply({success:false,message:'Payment request not found.'},404);return reply(await checkPayment(attempt));}return reply({success:true,content:await Order.find({userId:auth.userId})});}catch{return reply({success:false,pending:!!request.nextUrl.searchParams.get('paymentId'),message:'Unable to confirm payment right now. Do not pay again; check its status shortly.'},503);}}
