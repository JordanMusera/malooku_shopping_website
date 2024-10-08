import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
    const cookie = request.headers.get('cookie'); // Get all cookies from the headers
    console.log(cookie);
    console.log('Hello');

    return NextResponse.next();
}

export const config = {
    matcher: ['/', '/your-route-here'], // Define which routes trigger the middleware
};
