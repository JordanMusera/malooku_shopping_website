import mongoose, { Schema } from "mongoose";

const cartSchema = new Schema({
    _id:String,
    id:Number,
    userId:Number,
    date:Date,
    products:[
        {
            productId:Number,
            quantity:Number
        }
    ]
});

const Cart = mongoose.models.Cart || mongoose.model('Cart',cartSchema);

export default Cart;