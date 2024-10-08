import dbConnect from "@/app/config/database";
import User from "@/app/models/user";
import Uvemail from "@/app/models/uvemail";
import { NextResponse } from "next/server";

export async function POST(request:Request,response:Response){
    await dbConnect();
    const {userEmail,otpCode} = await request.json();

    const uvemail = await Uvemail.findOne({'user.email':userEmail,otpCode:otpCode});
    console.log(otpCode)

    if(uvemail){
        const newUser = new User(uvemail.user);
        await newUser.save();

        const uvemail1 = await Uvemail.findOneAndDelete({'user.email':userEmail,otpCode:otpCode})
        if(uvemail1){
            console.log('deleted');
        }

        return NextResponse.json({success:true,message:'Account created successfully'})
    }

    return NextResponse.json({success:false,message:'Invalid otp code'})
    
}