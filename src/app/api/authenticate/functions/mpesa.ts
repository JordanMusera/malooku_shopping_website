import { TIMEOUT } from "dns";
import { NextResponse } from "next/server";
import { useState } from "react";

const consumerKey = process.env.MPESA_CONSUMER_KEY;
const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

export async function initiateMpesa(phone: number, price: number) {
    let accessToken;
    const shortcode = '174379';
    const passkey = 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919';
    const timestamp = await generateTimeStamp();
    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');

    const res1 = await fetch('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',{
        headers:{
            'Authorization': `Basic ${auth}`,
        }
    });
    
    const response = await res1.json();
    accessToken=response.access_token;

    const res2 = await fetch('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "BusinessShortCode": "174379",
            "Password": password,
            "Timestamp": timestamp,
            "TransactionType": "CustomerPayBillOnline",
            "Amount": 1,
            "PartyA": phone,
            "PartyB": "174379",
            "PhoneNumber": phone,
            "CallBackURL": "https://mydomain.com/pat",
            "AccountReference": "Malooku Stores",
            "TransactionDesc": "Purchase product(s)"
        })
    });

    const response2 = await res2.json();

    if(response2.errorMessage){
        const b2 = {
            processed:false,
            ResultCode:'0',
            ResultDesc:response2.errorMessage
        }
        return b2
    }

    console.log('Response body:', JSON.stringify(response2, null, 2));
    console.log("Amount: "+price)

    const body = await confirmPayment(accessToken,password,timestamp,response2.CheckoutRequestID);
    const b2 = {
        processed:true,
        ResultCode:body.ResultCode,
        ResultDesc:body.ResultDesc
    }

    return b2;
    

}

const confirmPayment=async(accessToken:string,password:string,timestamp:string,CheckoutRequestID:string)=>{
    const res = await fetch('https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query',{
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body:JSON.stringify({
            "BusinessShortCode":"174379",    
            "Password": password,    
            "Timestamp":timestamp,    
            "CheckoutRequestID": CheckoutRequestID,  
        })
    })

    const response = await res.json();
    if(response.ResponseCode){
        return response;
    }else{
        return await confirmPayment(accessToken,password,timestamp,CheckoutRequestID)
    }
    
}

const generateTimeStamp=()=>{
const now = new Date();
const year = now.getFullYear();
const month = String(now.getMonth() + 1).padStart(2, '0');
const day = String(now.getDate()).padStart(2, '0');
const hours = String(now.getHours()).padStart(2, '0');
const minutes = String(now.getMinutes()).padStart(2, '0');
const seconds = String(now.getSeconds()).padStart(2, '0');

const timestamp = `${year}${month}${day}${hours}${minutes}${seconds}`;

console.log('Timestamp:', timestamp);
return timestamp;
}
