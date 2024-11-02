import mongoose, { Schema } from "mongoose";

const review_schema = new Schema({
    productId: String,
    comments: [
        {
            userName: String,
            userId: String,
            comment:String,
            likes:Number,
            dislikes:Number,
        }
    ],

});

const ProductReview = mongoose.models.ProductReview||mongoose.model('ProductReview',review_schema);
export default ProductReview;