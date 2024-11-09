import dbConnect from "@/app/config/database";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "../../../authenticate/functions/auth";
import User from "@/app/models/user";
import ProductReview from "@/app/models/product_review";
import PurchasedProduct from "@/app/models/purchased_product";
import { uploadMultipleToCloudinary } from "@/app/api/authenticate/functions/cloudinary";

export async function POST(request: NextRequest) {
    try {
        await dbConnect();
       
        const data = await request.formData();
        const productId = data.get('productId') as string;
        const comment = data.get('review') as string;
        const rating = parseFloat(data.get('rating') as string);
        const images = [];

        const fileArray = data.getAll('images') as File[];
        const bufferArray = await Promise.all(
            fileArray.map(async(file)=>{
                const bytes = await file.arrayBuffer();
                return Buffer.from(bytes);
            })
        )

        const cdres = await uploadMultipleToCloudinary(bufferArray);
        if (!cdres) {
            return NextResponse.json({ success: false, message: 'Upload failed.' });            
        }

        console.log(cdres);

        for(const item of cdres){
            images.push({
                imageUrl: item.secure_url,
                publicId: item.public_id,
                assetId: item.asset_id
            })
        }
       
        const authToken = request.cookies.get('authToken')?.value || '';
        const authObj = await verifyToken(authToken);
        const userId = authObj.userId;

        const user = await User.findById(userId);
        const userPurchased = await PurchasedProduct.findOne({ userId: userId });

        if (user && userPurchased) {
            const productReviews = await ProductReview.findOne({ productId: productId });
            if (productReviews) {
                productReviews.comments.push({
                    userName: user.username,
                    userId: userId,
                    comment: comment,
                    rating: rating,
                    images:images,
                    //replies:replies
                });

                await productReviews.save();

                const purcased_products = await PurchasedProduct.findOne({userId:userId});
                if(purcased_products){
                    const pdIndex = purcased_products.purchasedList.findIndex((item:any)=>item.productId===productId);
                    if (pdIndex !== -1) {
                        purcased_products.purchasedList[pdIndex].reviewed = true;
                        await purcased_products.save();
                    }
                    const rrs = await purcased_products.save();
                    console.log("RRS: "+rrs);
                }

                return NextResponse.json({ success: true, message: 'Review posted', content: productReviews });
            } else {
                const productReview = new ProductReview({
                    productId: productId,
                    comments: [
                        {
                            userName: user.username,
                            userId: userId,
                            comment: comment,
                            rating: rating,
                            images:images,
                            //replies:replies
                        }
                    ]

                });
                await productReview.save();

                const purcased_products = await PurchasedProduct.findOne({userId:userId});
                if(purcased_products){
                    const pdIndex = purcased_products.purchasedList.findIndex((item:any)=>item.productId===productId);
                    if (pdIndex !== -1) {
                        purcased_products.purchasedList[pdIndex].reviewed = true;
                        await purcased_products.save();
                    }
                    const rrs = await purcased_products.save();
                    console.log("RRS: "+rrs);
                }
                

                return NextResponse.json({ success: true, message: 'Review posted', content: productReview });
            }
        } else {
            return NextResponse.json({ success: false, message: 'User not authenticated!' });
        }
    } catch (error) {
        return NextResponse.json({ success: false, message: 'Some server error occurred!'});
    }
}

