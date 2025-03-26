import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
    const token = request.cookies.get('authToken')?.value || '';

    if (!token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
        const secretKey = new TextEncoder().encode(process.env.JWT_SECRET || "");
        await jwtVerify(token, secretKey);

        return NextResponse.next();
    } catch (error) {
        console.error("JWT Verification Error:", error);
        //return NextResponse.redirect(new URL('/login', request.url));
    }
}

export const config = {
    matcher: ['/account', '/another-protected-route']
};
