import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
    address:{
        city:String,
        street:String,
        number:Number,
        zipcode:String
    },
    id:String,
    email:String,
    username:String,
    password:String,
    name:{
        firstname:String,
        lastname:String
    },
    phone:String
})

const User = mongoose.models.User || mongoose.model('User',userSchema);

export default User;