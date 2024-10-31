import { verifyToken } from "@/app/api/authenticate/functions/auth";
import User from "@/app/models/user";
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/app/config/database";

export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        const authToken = request.cookies.get('authToken')?.value || '';
        const authObject = await verifyToken(authToken);
        const userId = authObject.userId;

        const {newShippingAddress} = await request.json();

        const user = await User.findById(userId);
        if (!user.shippingAddress) {
            user.shippingAddress = [];
        }

         user.shippingAddress.push({
               county:newShippingAddress.county,
               city:newShippingAddress.city,
               street:newShippingAddress.street,
               postalCode:newShippingAddress.postalCode
            });

            console.log(user.shippingAddress)
            await user.save();
            return NextResponse.json({success:true,message:'Address Added',content:user});
        
   } catch (error) {
       return NextResponse.json({success:false,message:'An error occurred',content:error});
   }

}

export async function DELETE(request:NextRequest){
    try {
        await dbConnect();
        const authToken = request.cookies.get('authToken')?.value || '';
        const authObject = await verifyToken(authToken);
        const userId = authObject.userId;

        const {shippingAddressId} = await request.json();

        const user = await User.findById(userId);
        const addressAvailable = user.shippingAddress.some((address: { _id: any; })=>address._id.toString()===shippingAddressId);

        if(addressAvailable){
            user.shippingAddress = user.shippingAddress.filter((address: { _id: any; }) => address._id.toString() !== shippingAddressId);
            await user.save();
            return NextResponse.json({success:true,message:'Address deleted',content:user})
        }else{
            return NextResponse.json({success:false,message:'Address not found'})
        }
    } catch (error) {
        return NextResponse.json({success:false,message:'Server error occurred'})
    }
    

       
}