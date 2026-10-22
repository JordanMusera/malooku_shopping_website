import { NextRequest, NextResponse } from 'next/server';
import { sign, verify, JwtPayload } from 'jsonwebtoken';
import dbConnect from '@/app/config/database';
import User from '@/app/models/user';
export async function currentAdmin(request:NextRequest) {
 const token=request.cookies.get('adminToken')?.value;
 if(!token || !process.env.JWT_SECRET) return null;
 let payload:JwtPayload;
 try { payload=verify(token,process.env.JWT_SECRET,{algorithms:['HS256'],audience:'malooku-admin',issuer:'malooku'}) as JwtPayload; } catch {return null;}
 await dbConnect();
 return User.findOne({_id:payload.sub,role:'admin'}).select('_id fullname email');
}
export function invalidOrigin(request:NextRequest) {const origin=request.headers.get('origin');return !!origin && origin!==new URL(request.url).origin;}
export async function requireAdmin(request:NextRequest) {
 if(request.method!=='GET' && invalidOrigin(request)) return NextResponse.json({success:false,message:'Invalid request origin.'},{status:403});
 if(!await currentAdmin(request)) return NextResponse.json({success:false,message:'Please sign in as an administrator.'},{status:401});
 return null;
}
export function adminSession(id:string) {
 if(!process.env.JWT_SECRET) throw new Error('JWT_SECRET must be configured');
 const token=sign({},process.env.JWT_SECRET,{algorithm:'HS256',subject:id,audience:'malooku-admin',issuer:'malooku',expiresIn:'8h'});
 const response=NextResponse.json({success:true});
 response.cookies.set('adminToken',token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict',path:'/',maxAge:28800});
 response.headers.set('Cache-Control','no-store');
 return response;
}
