import { Schema } from "mongoose";

const orderSchema = new Schema({
    userId:String,
    products:[
        {
            productId:String,
            quantity:Number,
            productPrice:Number
        }
    ],
    totalCost:Number,
    orderDate:{type:Date,default:Date.now},
    status:{type:String,enum:['pending','shipped','delivered','cancelled'],default:'pending'},
    shippingAddress:{
        postalCode:{type:String,require:true},
        street:{type:String,required:true},
        city:{type:String,required:true},
        county:{type:String,required:true},
    },
    paymentMethod:{type:String,enum:['mpesa,credit_card'],require:true}
});