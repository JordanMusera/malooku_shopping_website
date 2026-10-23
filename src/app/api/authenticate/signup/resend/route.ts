import dbConnect from "@/app/config/database";
import { sendEmailCode } from "@/app/lib/email";
import { issueEmailCode, normalizeEmail, rollbackEmailCode, validEmail } from "@/app/lib/email-codes";
import EmailCode from "@/app/models/email_code";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { userEmail } = await request.json();
    if (!validEmail(userEmail)) return NextResponse.json({ success: false, message: "Enter a valid email address." }, { status: 400 });
    await dbConnect();
    const email = normalizeEmail(userEmail);
    const pending = await EmailCode.findOne({ email, purpose: "signup", expiresAt: { $gt: new Date() } });
    if (!pending?.pendingUser) return NextResponse.json({ success: false, message: "This signup code has expired. Start signup again to request a new one." }, { status: 400 });
    const issued = await issueEmailCode(email, "signup", pending.pendingUser);
    if (issued.limited) return NextResponse.json({ success: false, message: "Please wait a minute before requesting another code." }, { status: 429 });
    try {
      await sendEmailCode(email, issued.code, "signup");
    } catch (error) {
      await rollbackEmailCode(email, "signup", issued.hash);
      console.error("Signup verification email could not be resent:", error instanceof Error ? error.message : "unknown mail error");
      return NextResponse.json({ success: false, message: "We couldn't send the verification email. Please try again later." }, { status: 503 });
    }
    return NextResponse.json({ success: true, message: "A new verification code was sent. Check your email inbox." });
  } catch (error) {
    console.error("Signup code resend failed:", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json({ success: false, message: "We couldn't resend your code right now. Please try again." }, { status: 500 });
  }
}
