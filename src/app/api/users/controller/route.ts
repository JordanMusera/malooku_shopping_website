import dbConnect from "@/app/config/database";
import User from "@/app/models/user";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request:NextRequest){
    try {
        await dbConnect();
        const users = await User.find({});
        if(users){
            return NextResponse.json({success:true,message:'Users fetched successfully',content:users});
        }else{
            return NextResponse.json({success:false,message:'Users not found'});
        }
    } catch (error) {
        return NextResponse.json({success:false,message:'Some server error occurred'});
    }
}