import { NextRequest, NextResponse } from "next/server";
import jwt from 'jsonwebtoken'
import { stringify } from "querystring";

export function middleware(request: NextRequest) {
    const cookie = request.cookies.get('authToken')?.value||'';
    console.log(cookie);
    console.log('Hello');

    console.log("Token Validity: ")

    return NextResponse.next();
}

export const config = {
    matcher: ['/', '/your-route-here'], // Define which routes trigger the middleware
};


