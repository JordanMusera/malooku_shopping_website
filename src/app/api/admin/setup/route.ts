import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from '@/app/models/user';
import dbConnect from '@/app/config/database';
import { adminSession, invalidOrigin } from '@/app/lib/admin-auth';
// A fixed bootstrap record makes concurrent first-admin requests atomic on standalone MongoDB.
const bootstrapId=new mongoose.Types.ObjectId('0000000000000000000ad001');
export async function POST(request:NextRequest) {
 if(invalidOrigin(request))return NextResponse.json({success:false,message:'Invalid request origin.'},{status:403});
 try {
  if(!process.env.JWT_SECRET)throw new Error('Missing session configuration');
  await dbConnect();
  if(await User.exists({role:'admin'}))return NextResponse.json({success:false,message:'Admin setup is already complete. Please sign in.'},{status:409});
  const body=await request.json();
  const name=typeof body.name==='string'?body.name.trim():'';
  const email=typeof body.email==='string'?body.email.trim().toLowerCase():'';
  const password=typeof body.password==='string'?body.password:'';
  if(!name || name.length>100 || email.length>254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length<12 || Buffer.byteLength(password)>72 || password!==body.confirmPassword)return NextResponse.json({success:false,message:'Enter your name, a valid email, and matching passwords of at least 12 characters (maximum 72 bytes).'}, {status:400});
  if(await User.findOne({email}).collation({locale:'en',strength:2}))return NextResponse.json({success:false,message:'This email already belongs to an account. Use a different email for your admin login.'},{status:409});
  const hashed=await bcrypt.hash(password,12);
  // Returning the previous document distinguishes the winner without ever overwriting credentials.
  const previous=await User.collection.findOneAndUpdate({_id:bootstrapId},{$setOnInsert:{_id:bootstrapId,username:name,fullname:name,email,password:hashed,role:'admin',shippingAddress:[],paymentMethods:[]}},{upsert:true,returnDocument:'before'});
  if(previous)return NextResponse.json({success:false,message:'Admin setup is already complete. Please sign in.'},{status:409});
  return adminSession(String(bootstrapId));
 }catch(error:any){
  if(error?.code===11000)return NextResponse.json({success:false,message:'Admin setup is already complete. Please sign in.'},{status:409});
  return NextResponse.json({success:false,message:'Unable to create the admin account. Please try again.'},{status:503});
 }
}
