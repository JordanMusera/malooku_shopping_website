import mongoose, { Schema } from "mongoose";

const verificationOtpSchema = new Schema({
    user:{
        username:String,
        email:String,
        password:String
    },
    otpCode:Number
})

const Uvemail = mongoose.models.Uvemail || mongoose.model('Uvemail',verificationOtpSchema);
export default Uvemail;