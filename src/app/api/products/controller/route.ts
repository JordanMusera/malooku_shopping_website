import dbConnect from "@/app/config/database";
import Product from "@/app/models/product";
import { NextRequest, NextResponse } from "next/server";
import { uploadMultipleToCloudinary } from "../../authenticate/functions/cloudinary";

export async function GET(request:NextRequest){
    try {
        await dbConnect();
        const products = await Product.find({});

        if(products){
            return NextResponse.json({success:true,message:'Products fetched successfully',content:products});
        }else{
            return NextResponse.json({success:false,message:'No products were found!'});
        }
    } catch (error) {
        return NextResponse.json({success:false,message:'Some server error occurred!'});
    }
}

export async function POST(request:NextRequest){
    try {
        await dbConnect();

        const data = await request.formData();
        console.log(data);

        const productName = data.get('productName') as string;
        const productPrice = data.get('productPrice') as string;
        const productDescription = data.get('productDescription') as string;
        const productCategory = data.get('productCategory') as string;
        const productSpecifications = data.get('productSpecifications') as string;
        const specifications = JSON.parse(productSpecifications);
        const productQty = data.get('productQty') as string;

        const imageArray = data.getAll('images') as File[];
        const bufferArray = await Promise.all(
            imageArray.map(async(file)=>{
                const bytes = await file.arrayBuffer();
                return Buffer.from(bytes);
            })
        );

        const cdres = await uploadMultipleToCloudinary(bufferArray);
        if (!cdres) {
            return NextResponse.json({ success: false, message: 'Upload failed.' });            
        }

        const imageUrls = [];

        for(const item of cdres){
            imageUrls.push({
                imageUrl: item.secure_url,
                publicId: item.public_id,
                assetId: item.asset_id
            })
        }

        const product = new Product({
            title:productName,
            price:productPrice,
            description:productDescription,
            category:productCategory,
            images:imageUrls,
            specifications:specifications,
            qty:productQty
        });

        await product.save();
        return NextResponse.json({success:true,message:'Product saved successfully'});
    } catch (error) {
        return NextResponse.json({success:false,message:'Some server error occurred'});
    }
}