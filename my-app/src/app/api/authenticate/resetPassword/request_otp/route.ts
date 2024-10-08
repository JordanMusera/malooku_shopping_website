import dbConnect from "@/app/config/database";
import Rremail from "@/app/models/rremail";
import { NextResponse } from "next/server";
import User from "@/app/models/user";

export async function POST(request:Request,response:Response){
    await dbConnect();
    const {email} = await request.json();

    const user = await User.findOne({email:email});
    if(!user){
        return NextResponse.json({success:false,message:'Email not found!'})
    }

    const otpCode = await generateFiveDigitNumber();

    const rremail1 = await Rremail.findOneAndDelete({email:email});
    if(rremail1){
        console.log('deleted');
    }

    const rremail = new Rremail({
        email:email,
        otpCode:otpCode
    })

    await rremail.save();
    return NextResponse.json({success:true,message:'OTP code sent to email'})
    
}

const generateFiveDigitNumber=()=>{
    return Math.floor(10000 + Math.random() * 90000);
}