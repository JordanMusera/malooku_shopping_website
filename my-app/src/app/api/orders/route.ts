import { NextRequest } from "next/server";
import dbConnect from "@/app/config/database";
import { verifyToken } from "../authenticate/functions/auth";

export async function POST(request:NextRequest){
    await dbConnect();

    const authToken = request.cookies.get('authToken')?.value||'';
    const authObject = await verifyToken(authToken);
    const userId = authObject.userId;

    
}