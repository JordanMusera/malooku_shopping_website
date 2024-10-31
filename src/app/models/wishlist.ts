import mongoose, { Schema } from "mongoose";

const wishlistSchema = new Schema({
    userId:String,
    wishlist:[
        {
            productId:String
        }
    ]
})

const Wishlist = mongoose.models.Wishlist || mongoose.model('Wishlist',wishlistSchema);
export default Wishlist;