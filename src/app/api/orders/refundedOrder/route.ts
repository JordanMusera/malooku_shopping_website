import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "../../authenticate/functions/auth";
import User from "@/app/models/user";
import RefundOrder from "@/app/models/refund_order";
import dbConnect from "@/app/config/database";

export async function GET(request: NextRequest) {
    await dbConnect();
    try {
        const authToken = request.cookies.get('authToken')?.value || '';
        const authObj = await verifyToken(authToken);
        const userId = authObj.userId;

        const user = await User.findById(userId);

        if (user) {
            const refundedOrders = await RefundOrder.find({ userId: userId });
            if (refundedOrders) {
                return NextResponse.json({ success: true, message: 'success', content: refundedOrders });
            }
            return NextResponse.json({ success: false, message: 'You have no refunded orders' });
        }
        return NextResponse.json({ success: false, message: 'User not authenticated.' });
    } catch (error) {
        
        return NextResponse.json({ success: false, message: 'Some server error occurred' });
    }

}