import mongoose, { Schema } from "mongoose";

const rremailSchema = new Schema({
    email:String,
    otpCode:String
})

const Rremail = mongoose.models.Rremail || mongoose.model('Rremail',rremailSchema);

export default Rremail;