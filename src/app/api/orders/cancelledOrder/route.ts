import dbConnect from "@/app/config/database";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "../../authenticate/functions/auth";
import Order from "@/app/models/order";
import User from "@/app/models/user";
import CancelledOrder from "@/app/models/cancelled_order";

export async function POST(request: NextRequest) {
    await dbConnect();

    const authToken = request.cookies.get('authToken')?.value || '';
    const authObj = await verifyToken(authToken);
    const userId = authObj.userId;
    const { orderId, productId } = await request.json();

    const user = await User.findById(userId);

    if (user) {
        let order = await Order.findById(orderId);
        const productIndex = order.products.findIndex((p: { product: { _id: { toString: () => any; }; }; }) => p.product._id.toString() === productId);

        if (productIndex !== -1 && order.status==='pending') {
            order.products.splice(productIndex, 1);
            await order.save();

            const p = order.products[productIndex];

            
                const cancelledOrder = new CancelledOrder({
                    userId: userId,
                    status: 'cancelled',
                    orderId: orderId,
                    productId: productId,
                    product:p.product,
                    quantity: p.quantity,
                    productQtyPrice: p.productQtyPrice
                });
                const co1 = await cancelledOrder.save();
                return NextResponse.json(co1);
            


        }else{
            return NextResponse.json("NOO!")
        }
    }
}

export async function GET(request:NextRequest){
    await dbConnect();

    const authToken = request.cookies.get('authToken')?.value || '';
    const authObj = await verifyToken(authToken);
    const userId = authObj.userId;

    const cancelledOrders = await CancelledOrder.find({userId});
    return NextResponse.json(cancelledOrders);
}
