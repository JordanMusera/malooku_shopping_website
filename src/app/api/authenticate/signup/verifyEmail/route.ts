import dbConnect from "@/app/config/database";
import User from "@/app/models/user";
import { consumeEmailCode, normalizeEmail, validCode, validEmail } from "@/app/lib/email-codes";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { userEmail, otpCode } = await request.json();
    if (!validEmail(userEmail) || !validCode(String(otpCode ?? ""))) return NextResponse.json({ success: false, message: "Enter a valid email and five-digit code." }, { status: 400 });
    await dbConnect();
    const email = normalizeEmail(userEmail);
    const consumed = await consumeEmailCode(email, "signup", String(otpCode));
    if (!consumed.ok || !consumed.record.pendingUser) return NextResponse.json({ success: false, message: "That code is invalid or expired. Request a new code and try again." }, { status: 400 });
    const newUser = new User(consumed.record.pendingUser);
    await newUser.save();
    return NextResponse.json({ success: true, message: "Your email is verified and your account is ready." });
  } catch (error) {
    console.error("Signup verification failed:", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json({ success: false, message: "We couldn't verify your account right now. Please try again." }, { status: 500 });
  }
}
