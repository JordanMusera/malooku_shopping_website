import { verifyToken } from "@/app/api/authenticate/functions/auth";
import { uploadMultipleToCloudinary } from "@/app/api/authenticate/functions/cloudinary";
import Order from "@/app/models/order";
import RefundOrder from "@/app/models/refund_order";
import User from "@/app/models/user";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const userToken = request.cookies.get('authToken')?.value || '';
    const userObj = await verifyToken(userToken);
    const userId = userObj?.userId;

    if (!userId) {
        return NextResponse.json({ success: false, message: 'User authentication failed.' });
    }

    const user = await User.findById(userId);
    if (!user) {
        return NextResponse.json({ success: false, message: 'User not found.' });
    }

    const data = await request.formData();
    const orderId = data.get('orderId') as string;
    const productId = data.get('productId') as string;

    const order = await Order.findOne({ userId, _id: orderId });
    if (!order) {
        return NextResponse.json({ success: false, message: 'Order not found.' });
    }

    const CAProduct = order.products.find((item: { product: { _id: { toString: () => string; }; }; }) => item.product._id.toString() === productId);
    if (!CAProduct) {
        return NextResponse.json({ success: false, message: 'Product not found in order.' });
    }

    const fileArray = data.getAll('images') as File[];
    const bufferArray = await Promise.all(
        fileArray.map(async (file) => {
            const bytes = await file.arrayBuffer();
            return Buffer.from(bytes);
        })
    );

    const cdres = await uploadMultipleToCloudinary(bufferArray);
    if (!cdres) {
        return NextResponse.json({ success: false, message: 'Image upload failed.' });
    }

    const CA = new RefundOrder({
        userId,
        orderId,
        productId,
        order: CAProduct,
        selectedReason:data.get('selectedReason'),
        providedReason:data.get('providedReason'),
        messages:[
            {message:'Refund requested by user'},
            {message:'Request is being processed'}
        ],
        images: cdres.map((res:any) => (
            {url:res.secure_url,
            publicId:res.public_id,
            assetId:res.asset_id
            })),
        
    });

    await CA.save();
    console.log(CA);

    return NextResponse.json({ success: true, message: 'Application submitted.', content: CA });
}
