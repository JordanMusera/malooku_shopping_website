import dbConnect from "@/app/config/database";
import User from "@/app/models/user";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { sign } from "jsonwebtoken";
import { serialize } from "cookie";

export async function POST(request: Request) {
    await dbConnect();
    const { userEmail, userPassword } = await request.json();

    const user = await User.findOne({ email: userEmail });
    if (!user) {
        return NextResponse.json({ success: false, message: "User does not exist" });
    }

    const passwordValid = await bcrypt.compare(userPassword, user.password);
    if (!passwordValid) {
        return NextResponse.json({ success: false, message: "Invalid credentials!" });
    }

    const secret = process.env.JWT_SECRET || "";
    const maxAge = 60 * 60 * 24 * 15;
    const token = sign({ userEmail, userId: user._id }, secret, { expiresIn: maxAge });

    const serialized = serialize("authToken", token, {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: maxAge,
    });

    const response = NextResponse.json({ success: true, message: "Login Success", content: user });
    response.headers.set("Set-Cookie", serialized);

    return response;
}
