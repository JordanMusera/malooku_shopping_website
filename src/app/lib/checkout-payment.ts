import {recordPayment} from '@/app/models/payments';
import PaymentAttempt from '@/app/models/payment_attempt';
import Order from '@/app/models/order';
import Cart from '@/app/models/cart';
import OrderProgress from '@/app/models/orderprogress';
import PurchasedProduct from '@/app/models/purchased_product';
import {queryMpesa,isProcessingResult} from '@/app/api/authenticate/functions/mpesa';
export async function checkPayment(attempt:any){
 await recordPayment(attempt);
 if(attempt.state==='paid')return {success:true,orderId:String(attempt._id)};
 if(attempt.state==='failed' && !isProcessingResult(attempt.lastResultCode,attempt.message))return {success:false,pending:false,message:attempt.message};
 if(!attempt.checkoutId)return {success:false,pending:true,paymentId:String(attempt._id),message:attempt.message||'Waiting for M-Pesa to acknowledge the request. Do not send another payment.'};
 const result=await queryMpesa(attempt.checkoutId);
 if(result.state==='pending'){
  await PaymentAttempt.updateOne({_id:attempt._id,state:{$ne:'paid'}},{$set:{state:'pending',message:result.message,lastResultCode:result.code}});
  return {success:false,pending:true,paymentId:String(attempt._id),message:result.message};
 }
 if(result.state==='failed'){await PaymentAttempt.updateOne({_id:attempt._id,state:{$ne:'paid'}},{$set:{state:'failed',message:result.message,lastResultCode:result.code},$unset:{activeKey:1}});return {success:false,pending:false,message:result.message};}
 // Stable document IDs make confirmation safe to repeat after a refresh or callback.
 const order=await Order.findOneAndUpdate({_id:attempt._id},{$setOnInsert:{...attempt.order,paymentAmount:attempt.amount,paymentEnvironment:attempt.environment}},{upsert:true,new:true,setDefaultsOnInsert:true});
 await OrderProgress.updateOne({_id:attempt._id},{$setOnInsert:{orderId:String(order._id),orderProgress:[{orderStatus:'pending',date:order.orderDate.toISOString(),description:'Awaiting packaging and dispatch'}],totalCost:order.totalCost,shippingAddress:order.shippingAddress,deliveryInfo:order.deliveryInfo}},{upsert:true});
 // Use one stable ID per account, with stable subdocument IDs from the attempt snapshot.
 await PurchasedProduct.updateOne({_id:attempt.order.purchaseHistoryId},{$setOnInsert:{userId:attempt.userId},$addToSet:{purchasedList:{$each:attempt.order.products.map((item:any)=>({_id:item.purchaseId,status:'pending',productId:String(item.product._id),product:item.product,reviewed:false}))}}},{upsert:true});
 await Cart.deleteOne({_id:attempt.cartId,products:attempt.cartProducts});
 await PaymentAttempt.updateOne({_id:attempt._id},{$set:{state:'paid'},$unset:{activeKey:1}});
 return {success:true,orderId:String(order._id)};
}
