import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
    address:{
        county:String,
        city:String,
        street:String,
    },
    id:String,
    username:String,
    fullname:String,
    email:String,
    phone:String,
    password:String,
})

const User = mongoose.models.User || mongoose.model('User',userSchema);

export default User;