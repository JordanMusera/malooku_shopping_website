import { requireAdmin } from '@/app/lib/admin-auth';
import dbConnect from "@/app/config/database";
import User from "@/app/models/user";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request:NextRequest){
    try {
        const denied = await requireAdmin(request); if (denied) return denied;
        await dbConnect();
        const users = await User.find({}).select('-password');
        if(users){
            return NextResponse.json({success:true,message:'Users fetched successfully',content:users});
        }else{
            return NextResponse.json({success:false,message:'Users not found'});
        }
    } catch (error) {
        return NextResponse.json({success:false,message:'Some server error occurred'});
    }
}