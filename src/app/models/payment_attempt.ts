import mongoose,{Schema} from 'mongoose';
import {recordPayment} from './payments';
const schema=new Schema({userId:{type:String,required:true},activeKey:{type:String},state:{type:String,default:'starting'},checkoutId:String,amount:Number,environment:String,order:Object,cartId:Schema.Types.ObjectId,cartProducts:Array,message:String,lastResultCode:String},{timestamps:true});
schema.index({activeKey:1},{unique:true,sparse:true});
// Persist the ledger before checkout sends the STK request, and on every status change.
schema.post('save', async function(doc) { await recordPayment(doc); });
schema.post('updateOne', async function() {
 const attempt = await this.model.findOne({_id: this.getFilter()._id});
 if (attempt) await recordPayment(attempt);
});
schema.post('findOneAndUpdate', async function(doc) {
 if (doc) {
  const attempt = await this.model.findById(doc._id);
  if (attempt) await recordPayment(attempt);
 }
});
export default mongoose.models.PaymentAttempt||mongoose.model('PaymentAttempt',schema);
