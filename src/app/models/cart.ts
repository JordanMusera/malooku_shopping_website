import mongoose, { Schema } from "mongoose";

const cartSchema = new Schema({
    id:String,
    userId:String,
    date:Date,
    products:[
        {
            productId:String,
            quantity:Number,
            selectedProductVariants:{type:Object, default:{}},
        }
    ]
});

const Cart = mongoose.models.Cart || mongoose.model('Cart',cartSchema);

export default Cart;