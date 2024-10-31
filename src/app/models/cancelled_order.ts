import mongoose, { Schema } from "mongoose";

const cancelledOrderSchema = new Schema({
    userId:String,
    status:String,
    orderId:String,
    productId:String,
    product:Object,
    cancellationDate:{type:Date,default:Date.now},
    quantity:Number,
    productQtyPrice:Number    
});

const CancelledOrder = mongoose.models.CancelledOrder || mongoose.model('CancelledOrder',cancelledOrderSchema);
export default CancelledOrder;