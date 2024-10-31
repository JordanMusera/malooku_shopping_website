import User from "@/app/models/user";
import bcrypt from "bcrypt"
import { NextResponse } from "next/server";
import Rremail from "@/app/models/rremail";

export async function POST(request:Request,response:Response){
    const {email,password,otpCode} = await request.json();

    const hashedPassword = await hashPassword(password);

    const user = await User.findOne({email:email});
    const otpCode1 = await Rremail.findOne({email:email,otpCode:otpCode});

    if(user){
        if(otpCode1){
            user.password = hashedPassword;
        await user.save();

        const rremail = await Rremail.findOneAndDelete({email:email,otpCode:otpCode});
        if(rremail){
            console.log('deleted');
        }

        return NextResponse.json({success:true,message:'Password updated'});
        }else{
            return NextResponse.json({success:false,message:'Invalid OTP code'})
        }
        
    }

    return NextResponse.json({success:false,message:'User not found'})
}

const hashPassword =async(password:string)=>{
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password,salt);
    return hashedPassword;
}