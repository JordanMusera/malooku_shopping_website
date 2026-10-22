import mongoose, {Schema} from 'mongoose';

const schema = new Schema({
 userId: {type: String, required: true, index: true},
 state: {type: String, required: true},
 amount: Number,
 currency: {type: String, default: 'KES'},
 environment: String,
 checkoutId: String,
 orderId: Schema.Types.ObjectId,
 message: String,
 lastResultCode: String,
 receiptNumber: String,
 confirmationSource: String,
 transactionDate: String,
 confirmedAt: Date,
}, {timestamps: true});

const Payment = mongoose.models.Payment || mongoose.model('Payment', schema);
export default Payment;

// A payment shares its attempt ID. Repeated callbacks cannot create duplicates.
// Copy only payment fields; address, phone and cart snapshots stay in the attempt.
export async function recordPayment(attempt: any) {
 const base = {userId: attempt.userId, amount: attempt.amount,
  currency: 'KES', environment: attempt.environment};
 try {
  await Payment.updateOne({_id: attempt._id}, {$setOnInsert: {
   ...base, state: 'starting', createdAt: attempt.createdAt || new Date(),
  }}, {upsert: true});
 } catch (error: any) {
  if (error?.code !== 11000) throw error;
 }
 // A slower pending query must never overwrite an already confirmed payment.
 await Payment.updateOne({_id: attempt._id, ...(attempt.state === 'paid' ? {} : {state: {$ne: 'paid'}})},
  {$set: {...base, state: attempt.state, checkoutId: attempt.checkoutId,
   message: attempt.message, lastResultCode: attempt.lastResultCode,
   ...(attempt.confirmation?.receiptNumber ? {receiptNumber:attempt.confirmation.receiptNumber,confirmationSource:attempt.confirmation.source,transactionDate:attempt.confirmation.transactionDate} : {}),
   ...(attempt.state === 'paid' ? {orderId: attempt._id,confirmedAt:attempt.confirmedAt} : {})}});
}
