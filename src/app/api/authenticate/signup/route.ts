import dbConnect from "@/app/config/database";
import User from "@/app/models/user";
import { sendEmailCode } from "@/app/lib/email";
import { issueEmailCode, normalizeEmail, rollbackEmailCode, validEmail } from "@/app/lib/email-codes";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

export async function POST(request: Request) {
  try {
    const { userName, userEmail, userPassword } = await request.json();
    if (typeof userName !== "string" || userName.trim().length < 6 || userName.trim().length > 80 || !validEmail(userEmail) || typeof userPassword !== "string" || userPassword.length < 6) {
      return NextResponse.json({ success: false, message: "Enter a username with at least 6 characters, a valid email, and a password with at least 6 characters." }, { status: 400 });
    }
    await dbConnect();
    const email = normalizeEmail(userEmail);
    const existing = await User.findOne({ email }).collation({ locale: "en", strength: 2 });
    if (existing) return NextResponse.json({ success: false, message: "An account with this email already exists." }, { status: 409 });

    const hashedPassword = await bcrypt.hash(userPassword, 10);
    const issued = await issueEmailCode(email, "signup", { username: userName.trim(), email, password: hashedPassword });
    if (issued.limited) return NextResponse.json({ success: false, message: "Please wait a minute before requesting another code." }, { status: 429 });
    try {
      await sendEmailCode(email, issued.code, "signup");
    } catch (error) {
      await rollbackEmailCode(email, "signup", issued.hash);
      console.error("Signup verification email could not be sent:", error instanceof Error ? error.message : "unknown mail error");
      return NextResponse.json({ success: false, message: "We couldn't send the verification email. Check the store's email configuration and try again." }, { status: 503 });
    }
    return NextResponse.json({ success: true, message: "Verification code sent. Check your email inbox." });
  } catch (error) {
    console.error("Signup request failed:", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json({ success: false, message: "We couldn't start signup right now. Please try again." }, { status: 500 });
  }
}
