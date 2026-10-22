import {recordPayment} from '@/app/models/payments';
import PaymentAttempt from '@/app/models/payment_attempt';
import Order from '@/app/models/order';
import Cart from '@/app/models/cart';
import OrderProgress from '@/app/models/orderprogress';
import PurchasedProduct from '@/app/models/purchased_product';
import {queryMpesa,isProcessingResult} from '@/app/api/authenticate/functions/mpesa';

export async function checkPayment(attempt:any):Promise<any>{
 if(attempt.state==='paid'){
  await recordPayment(attempt);
  return {success:true,orderId:String(attempt._id)};
 }
 const confirmation=attempt.confirmation?.state!=='pending'?attempt.confirmation:null;
 if(!confirmation && attempt.state==='review'){await recordPayment(attempt);return {success:false,pending:false,requiresReview:true,message:attempt.message||'This payment is unconfirmed and needs review.'};}
 if(!confirmation && attempt.state==='failed' && !isProcessingResult(attempt.lastResultCode,attempt.message))return {success:false,pending:false,message:attempt.message};
 if(!confirmation && !attempt.checkoutId)return {success:false,pending:true,paymentId:String(attempt._id),nextCheckMs:15000,message:attempt.message||'Waiting for M-Pesa to acknowledge the request. Do not send another payment.'};
 const result=confirmation||await queryMpesa(attempt.checkoutId);
 if(result.state==='pending' || result.state==='failed'){
  await PaymentAttempt.updateOne({_id:attempt._id,state:{$nin:['paid','review']},'confirmation.state':{$ne:'paid'}},
   {$set:{state:result.state,message:result.message,lastResultCode:result.code},...(result.state==='failed'?{$unset:{activeKey:1}}:{})});
  const latest=await PaymentAttempt.findById(attempt._id);
  if(latest?.state==='paid' || latest?.state==='review' || latest?.confirmation?.state==='paid')return checkPayment(latest);
  return {success:false,pending:result.state==='pending',paymentId:String(attempt._id),nextCheckMs:result.retryAfterMs||5000,message:result.message};
 }
 if(!confirmation)await PaymentAttempt.updateOne({_id:attempt._id,'confirmation.state':{$ne:'paid'}},{$set:{confirmation:{state:'paid',code:'0',message:result.message,source:'query'}}});
 // Stable IDs allow a callback, poll, or retry to finish the same order safely.
 const order=await Order.findOneAndUpdate({_id:attempt._id},{$setOnInsert:{...attempt.order,paymentAmount:attempt.amount,paymentEnvironment:attempt.environment}},{upsert:true,new:true,setDefaultsOnInsert:true});
 await OrderProgress.updateOne({_id:attempt._id},{$setOnInsert:{orderId:String(order._id),orderProgress:[{orderStatus:'pending',date:order.orderDate.toISOString(),description:'Awaiting packaging and dispatch'}],totalCost:order.totalCost,shippingAddress:order.shippingAddress,deliveryInfo:order.deliveryInfo}},{upsert:true});
 await PurchasedProduct.updateOne({_id:attempt.order.purchaseHistoryId},{$setOnInsert:{userId:attempt.userId},$addToSet:{purchasedList:{$each:attempt.order.products.map((item:any)=>({_id:item.purchaseId,status:'pending',productId:String(item.product._id),product:item.product,reviewed:false}))}}},{upsert:true});
 await Cart.deleteOne({_id:attempt.cartId,products:attempt.cartProducts});
 await PaymentAttempt.updateOne({_id:attempt._id},{$set:{state:'paid',lastResultCode:'0',message:'Payment confirmed.',confirmedAt:attempt.confirmedAt||new Date()},$unset:{activeKey:1}});
 return {success:true,orderId:String(order._id)};
}
