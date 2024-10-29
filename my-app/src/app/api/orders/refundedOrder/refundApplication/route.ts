import { verifyToken } from "@/app/api/authenticate/functions/auth";
import { NextRequest } from "next/server";

export async function POST(request:NextRequest){
    const userToken = request.cookies.get('authToken')?.value||'';
    const userObj = await verifyToken(userToken);
    const userId = userObj.userId;

    
}