import mongoose, { Schema } from "mongoose";

const orderSchema = new Schema({
    userId:String,
    products:Array,
    totalCost:Number,
    orderDate:{type:Date,default:Date.now},
    status:{type:String,enum:['pending','shipped','delivered','cancelled'],default:'pending'},
    shippingAddress:{
        postalCode:{type:String,require:true},
        street:{type:String,required:true},
        city:{type:String,required:true},
        county:{type:String,required:true},
    },
    paymentMethod:{
        accType:{type:String,enum:['mpesa','credit_card'],require:true},
        accNumber:Number,
        accName:String
    },
    deliveryInfo:{
        deliveryType:{type:String,enum:['pickup-station']},
        pickupStation:String
    }
});

const Order = mongoose.models.Order || mongoose.model('Order',orderSchema);
export default Order;