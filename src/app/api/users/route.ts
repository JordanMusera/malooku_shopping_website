import dbConnect from "@/app/config/database";
import { NextRequest, NextResponse } from "next/server";
import User from "@/app/models/user";
import { verifyToken } from "../authenticate/functions/auth";

export async function GET(request:NextRequest){
    await dbConnect();
    const token = request.cookies.get('authToken')?.value||'';
    const decodedToken = await verifyToken(token);
    const userId = decodedToken.userId;

    const user = await User.findById(userId);

    if(user){
        return NextResponse.json({success:true,user:user});
    }
    return NextResponse.json({success:false,message:'User not found'})
}

export async function POST(request:NextRequest){
    await dbConnect();
    const token = request.cookies.get('authToken')?.value||'';
    const decodedToken = await verifyToken(token);
    const userId = decodedToken.userId;

    const{county,city,street,fullName,email,phone} = await request.json();

    const user = await User.findById(userId);
    if(user){
        const currentUser = await User.findByIdAndUpdate( 
            userId,
            {
              address: {
                county: county,
                city: city,
                street: street
              },
              name: fullName,
              email: email,
              phone: phone
            },
        );

        return NextResponse.json({success:true,user:currentUser});
    }

    return NextResponse.json({success:false,message:'Information failed to updated'})


}