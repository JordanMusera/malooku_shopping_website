import jwt, { JwtPayload } from "jsonwebtoken";

interface TokenPayload extends JwtPayload {
    userId: string;
    userEmail: string;
}

export async function verifyToken(token:string){
    const decoded = await jwt.verify(token, process.env.JWT_SECRET || '') as TokenPayload;
    return decoded;
}