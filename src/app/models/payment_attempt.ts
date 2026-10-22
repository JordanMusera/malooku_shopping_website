import mongoose,{Schema} from 'mongoose';
const schema=new Schema({userId:{type:String,required:true},activeKey:{type:String},state:{type:String,default:'starting'},checkoutId:String,amount:Number,environment:String,order:Object,cartId:Schema.Types.ObjectId,cartProducts:Array,message:String},{timestamps:true});
schema.index({activeKey:1},{unique:true,sparse:true});
export default mongoose.models.PaymentAttempt||mongoose.model('PaymentAttempt',schema);
