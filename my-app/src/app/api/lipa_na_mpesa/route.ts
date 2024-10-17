import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "../authenticate/functions/auth";
import { initiateMpesa } from "../authenticate/functions/mpesa";

export async function POST(request:NextRequest){
    const authToken = request.cookies.get('authToken')?.value||'';
    const authObj = await verifyToken(authToken);
    const userId = authObj.userId;

    const res1 = await initiateMpesa(1,1);
    return NextResponse.json(res1);
}