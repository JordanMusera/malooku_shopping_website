import dbConnect from "@/app/config/database";
import { sendEmailCode } from "@/app/lib/email";
import { issueEmailCode, normalizeEmail, rollbackEmailCode, validEmail } from "@/app/lib/email-codes";
import User from "@/app/models/user";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email: submittedEmail } = await request.json();
    if (!validEmail(submittedEmail)) return NextResponse.json({ success: false, message: "Enter a valid email address." }, { status: 400 });
    await dbConnect();
    const email = normalizeEmail(submittedEmail);
    const user = await User.findOne({ email }).collation({ locale: "en", strength: 2 });
    if (!user) return NextResponse.json({ success: true, message: "If an account exists for that address, a reset code has been sent." });

    const issued = await issueEmailCode(email, "password_reset");
    if (issued.limited) return NextResponse.json({ success: false, message: "Please wait a minute before requesting another code." }, { status: 429 });
    try {
      await sendEmailCode(user.email, issued.code, "password_reset");
    } catch (error) {
      await rollbackEmailCode(email, "password_reset", issued.hash);
      console.error("Password reset email could not be sent:", error instanceof Error ? error.message : "unknown mail error");
      return NextResponse.json({ success: false, message: "We couldn't send a reset email right now. Please try again later." }, { status: 503 });
    }
    return NextResponse.json({ success: true, message: "Reset code sent. Check your email inbox." });
  } catch (error) {
    console.error("Password reset request failed:", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json({ success: false, message: "We couldn't start password reset right now. Please try again." }, { status: 500 });
  }
}
