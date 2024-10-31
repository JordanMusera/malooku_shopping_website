import { verifyToken } from "@/app/api/authenticate/functions/auth";
import dbConnect from "@/app/config/database";
import User from "@/app/models/user";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request:NextRequest){
   try {
        await dbConnect();
        const authToken = request.cookies.get('authToken')?.value || '';
        const authObject = await verifyToken(authToken);
        const userId = authObject.userId;

        const {paymentDetails} = await request.json();

        const user = await User.findById(userId);

        if(!user.paymentMethods){
            user.paymentMethods = [];
        }

        user.paymentMethods.push({
            accName:paymentDetails.accName,
            accNumber:paymentDetails.accNumber,
            accType:paymentDetails.accType
    })

        await user.save();
        return NextResponse.json({success:true,message:'Payment method added',content:user});
   } catch (error) {
       return NextResponse.json({success:false,message:'Some server error occurred!'});
   }
}

export async function DELETE(request:NextRequest){
    try {
        await dbConnect();
    const authToken = request.cookies.get('authToken')?.value || '';
    const authObject = await verifyToken(authToken);
    const userId = authObject.userId;

    const {paymentMethodId} = await request.json();

    const user = await User.findById(userId);

    if(user.paymentMethods){
        user.paymentMethods = user.paymentMethods.filter((method: { _id: { toString: () => any; }; })=>method._id.toString()!==paymentMethodId);
        await user.save();
        return NextResponse.json({success:true,message:"Payment method deleted",content:user});
    }else{
        return NextResponse.json({success:false,message:"Payment method not found"});
    }
    } catch (error) {
        return NextResponse.json({success:false,message:"Some server error occurred!"});
    }
    
}