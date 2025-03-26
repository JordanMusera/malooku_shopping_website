import mongoose from "mongoose";

const dbConnect=()=>{
    mongoose.connect('mongodb+srv://jordanmusera:SO0seG9aQHoTM2zN@cluster0.evxfehv.mongodb.net/malooku_db?retryWrites=true&w=majority&appName=Cluster0'
).then(()=>{
    console.log("db connection successful");
})
}

export default dbConnect;