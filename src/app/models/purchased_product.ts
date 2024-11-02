import mongoose, { Schema } from "mongoose";

const purchased_product_schema = new Schema({
    userId:String,
    purchasedList:[
        {
            status:{type:String,enum:['refunded','delivered']},
            reviewed:Boolean,
            productId:String
        }
    ]
})

const PurchasedProduct = mongoose.models.PurchasedProduct||mongoose.model('PurchasedProduct',purchased_product_schema);
export default PurchasedProduct;