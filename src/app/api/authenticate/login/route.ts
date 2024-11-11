import dbConnect from "@/app/config/database";
import User from "@/app/models/user";
import { NextResponse } from "next/server";
import bcrypt from 'bcrypt';
import {sign} from 'jsonwebtoken'
import { serialize } from "cookie";

export async function POST(request:Request,response:Response){
    await dbConnect()
    const {userEmail,userPassword} = await request.json();

    const user = await User.findOne({email:userEmail});

    if(!user){
        return NextResponse.json({success:false,message:'User does not exist'})
    }
 
    const passwordValid = await validatePassword(userPassword,user.password);

    if(passwordValid){

        const secret = process.env.JWT_SECRET || "";
    const maxAge = 60*60*24*15;

    const token = sign(
        {
            userEmail:userEmail,
            userId:user._id
        },secret,
        {
            expiresIn:maxAge
        }
    );

    const serialized = serialize("authToken",token,{
        httpOnly:true,
        sameSite:'strict',
        path:'/',
        maxAge:maxAge
    });

    return new Response(JSON.stringify({success:true,message:'Login Success',content:user}),
        {
        status:200,
        headers:{'Set-Cookie':serialized}
        })

    }else{
        return NextResponse.json({success:false,message:'Invalid credentials!'})
    }


    

}

const validatePassword=(userPassword:string,password:string)=>{
    const isPasswordValid = bcrypt.compare(userPassword,password);
    return isPasswordValid;
}