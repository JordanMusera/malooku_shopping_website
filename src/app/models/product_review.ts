import mongoose, { Schema } from "mongoose";

const review_schema = new Schema({
    productId: String,
    comments: [
        {
            userDp:{type:String,default:'https://th.bing.com/th/id/OIP.iPvPGJG166ivZnAII4ZS8gHaHa?rs=1&pid=ImgDetMain'},
            userName: String,
            userId: String,
            comment:String,
            likes:Number,
            images:[
                {imageUrl:String,publicId:String,assetId:String}
            ],
            replies:[
                {
                    userDp:{type:String,default:'https://th.bing.com/th/id/OIP.iPvPGJG166ivZnAII4ZS8gHaHa?rs=1&pid=ImgDetMain'},
                    userName:String,
                    userId:String,
                    reply:String,
                    date:{type:Date,default:Date.now}
                }
            ],
            date:{type:Date,default:Date.now}
        }
    ],

});

const ProductReview = mongoose.models.ProductReview||mongoose.model('ProductReview',review_schema);
export default ProductReview;