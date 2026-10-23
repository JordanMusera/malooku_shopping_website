import dbConnect from "@/app/config/database";
import User from "@/app/models/user";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { consumeEmailCode, normalizeEmail, validCode, validEmail } from "@/app/lib/email-codes";

export async function POST(request: Request) {
  try {
    const { email: submittedEmail, password, otpCode } = await request.json();
    if (!validEmail(submittedEmail) || !validCode(String(otpCode ?? "")) || typeof password !== "string" || password.length < 6) {
      return NextResponse.json({ success: false, message: "Enter your email, five-digit code, and a password with at least 6 characters." }, { status: 400 });
    }
    await dbConnect();
    const email = normalizeEmail(submittedEmail);
    const user = await User.findOne({ email }).collation({ locale: "en", strength: 2 });
    if (!user) return NextResponse.json({ success: false, message: "That code is invalid or expired. Request a new code and try again." }, { status: 400 });
    const consumed = await consumeEmailCode(email, "password_reset", String(otpCode));
    if (!consumed.ok) return NextResponse.json({ success: false, message: "That code is invalid or expired. Request a new code and try again." }, { status: 400 });
    user.password = await bcrypt.hash(password, 10);
    await user.save();
    return NextResponse.json({ success: true, message: "Password updated successfully. You can now sign in." });
  } catch (error) {
    console.error("Password update failed:", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json({ success: false, message: "We couldn't update your password right now. Please try again." }, { status: 500 });
  }
}
