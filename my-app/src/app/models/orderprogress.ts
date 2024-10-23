import mongoose, { Schema } from "mongoose";

const orderProgressSchema = new Schema({
    orderId:String,
    orderProgress:[
        {
            orderStatus:String,
            date:String,
            description:String
        }
    ],
    totalCost:Number,
    shippingAddress:Object,
    deliveryInfo:Object
})

const OrderProgress = mongoose.models.OrderProgress || mongoose.model('OrderProgress',orderProgressSchema);
export default OrderProgress;