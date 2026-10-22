import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import User from '@/app/models/user';
import dbConnect from '@/app/config/database';
import { adminSession, currentAdmin, invalidOrigin } from '@/app/lib/admin-auth';
export const dynamic='force-dynamic';
const attempts=new Map<string,{count:number,until:number}>();
export async function GET(request:NextRequest) {
 try {await dbConnect();const exists=!!await User.exists({role:'admin'});const admin=await currentAdmin(request);return NextResponse.json({success:true,needsSetup:!exists,authenticated:!!admin},{headers:{'Cache-Control':'no-store'}});}
 catch{return NextResponse.json({success:false,message:'Unable to check admin access. Please try again.'},{status:503});}
}
export async function POST(request:NextRequest) {
 if(invalidOrigin(request))return NextResponse.json({success:false,message:'Invalid request origin.'},{status:403});
 try {
  const body=await request.json();
  const email=typeof body.email==='string'?body.email.trim().toLowerCase():'';
  const password=typeof body.password==='string'?body.password:'';
  if(!email || email.length>254 || !password || Buffer.byteLength(password)>72)return NextResponse.json({success:false,message:'Enter a valid email and password.'},{status:400});
  const now=Date.now();attempts.forEach((value,key)=>{if(value.until<=now)attempts.delete(key);});
  const attempt=attempts.get(email)||{count:0,until:now+60000};
  if(attempt.count>=5)return NextResponse.json({success:false,message:'Too many attempts. Try again in a minute.'},{status:429});
  attempt.count++;attempts.set(email,attempt);
  await dbConnect();
  const user=await User.findOne({role:'admin',email}).collation({locale:'en',strength:2});
  if(!user || !await bcrypt.compare(password,user.password))return NextResponse.json({success:false,message:'Incorrect admin email or password.'},{status:401});
  attempts.delete(email);return adminSession(String(user._id));
 }catch{return NextResponse.json({success:false,message:'Unable to sign in. Please try again.'},{status:503});}
}
export async function DELETE(request:NextRequest) {
 if(invalidOrigin(request))return NextResponse.json({success:false},{status:403});
 const response=NextResponse.json({success:true});response.cookies.set('adminToken','',{httpOnly:true,sameSite:'strict',secure:process.env.NODE_ENV==='production',path:'/',maxAge:0});return response;
}
