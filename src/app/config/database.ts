import mongoose from "mongoose";

const dbConnect=()=>{
    mongoose.connect('mongodb://localhost:27017/botique1db'
).then(()=>{
    console.log("db connection successful");
})
}

export default dbConnect;