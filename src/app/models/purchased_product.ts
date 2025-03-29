import mongoose, { Schema } from "mongoose";

const purchased_product_schema = new Schema({
    userId:String,
    purchasedList:[
        {
            status:{type:String,enum:['undelivered','refunded','delivered']},
            reviewed:Boolean,
            productId:String,
            product:Object
        }
    ]
})

const PurchasedProduct = mongoose.models.PurchasedProduct||mongoose.model('PurchasedProduct',purchased_product_schema);
export default PurchasedProduct;