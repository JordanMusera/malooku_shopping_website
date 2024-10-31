import dbConnect from "@/app/config/database";
import User from "@/app/models/user";
import { NextResponse } from "next/server";
import bcrypt from 'bcrypt';
import Uvemail from "@/app/models/uvemail";

export async function POST(request:Request,response:Response){
    await dbConnect()
    const{userName,userEmail,userPassword} = await request.json();

    const user = await User.findOne({email:userEmail});

    if(user){
        return NextResponse.json({success:false,message:'User already exists!'})
    }

    const hashedPassword = await hashPassword(userPassword);
    const otpCode = await generateRandomFiveDigitNumber();

    const uvemail = await Uvemail.findOneAndDelete({'user.email':userEmail});
    if(uvemail){
        console.log('deleted')
    }

    const newVerificationOtp = new Uvemail({
        user:{
            username:userName,
            email:userEmail,
            password:hashedPassword
        },
        otpCode:otpCode
    })

    await newVerificationOtp.save()

    return NextResponse.json({success:true,message:'Enter Otp code sent to your email'})
  
}

const hashPassword=async(userPassword:string)=>{
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userPassword,salt)
    return hashedPassword;
}

const generateRandomFiveDigitNumber = () => {
    return Math.floor(10000 + Math.random() * 90000);
  };