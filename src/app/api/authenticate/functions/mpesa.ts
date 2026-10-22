export class MpesaError extends Error {constructor(message:string,public uncertain=false){super(message);}}
export function paymentSettings(){
 const environment=process.env.MPESA_ENVIRONMENT||'sandbox';
 const testAmount=environment==='sandbox'?Number(process.env.MPESA_TEST_AMOUNT||1):null;
 if(!['sandbox','production'].includes(environment) || (testAmount!==null && (!Number.isInteger(testAmount)||testAmount<1)))throw new MpesaError('M-Pesa configuration is invalid.');
 return {environment,testAmount};
}
export function mpesaConfig(){
 const {environment,testAmount}=paymentSettings();
 const shortcode=process.env.MPESA_SHORTCODE;
 const passkey=process.env.MPESA_PASSKEY;
 const callback=process.env.MPESA_CALLBACK_URL;
 if(!process.env.MPESA_CONSUMER_KEY || !process.env.MPESA_CONSUMER_SECRET || !shortcode || !passkey || !callback)throw new MpesaError('M-Pesa is not fully configured. Please contact the store.');
 try{const url=new URL(callback);if(url.protocol!=='https:'||['localhost','127.0.0.1'].includes(url.hostname))throw Error();}catch{throw new MpesaError('M-Pesa needs a public HTTPS callback URL.');}
 return {environment,testAmount,shortcode,passkey,callback,base:environment==='production'?'https://api.safaricom.co.ke':'https://sandbox.safaricom.co.ke'};
}
export function normalizePhone(value:unknown){let phone=String(value??'').replace(/[\s+-]/g,'');if(/^0[17]\d{8}$/.test(phone))phone='254'+phone.slice(1);if(/^[17]\d{8}$/.test(phone))phone='254'+phone;if(!/^254[17]\d{8}$/.test(phone))throw new MpesaError('Enter a valid Kenyan M-Pesa number.');return phone;}
function credentials(config:ReturnType<typeof mpesaConfig>){const timestamp=new Intl.DateTimeFormat('en-GB',{timeZone:'Africa/Nairobi',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(new Date());const part=(type:string)=>timestamp.find(p=>p.type===type)!.value;const time=['year','month','day','hour','minute','second'].map(part).join('');return {BusinessShortCode:config.shortcode,Password:Buffer.from(config.shortcode+config.passkey+time).toString('base64'),Timestamp:time};}
async function accessToken(config:ReturnType<typeof mpesaConfig>){
 try{const response=await fetch(config.base+'/oauth/v1/generate?grant_type=client_credentials',{headers:{Authorization:'Basic '+Buffer.from(process.env.MPESA_CONSUMER_KEY+':'+process.env.MPESA_CONSUMER_SECRET).toString('base64')},cache:'no-store',signal:AbortSignal.timeout(8000)});const data=await response.json();if(!response.ok||!data.access_token)throw Error();return data.access_token as string;}catch{throw new MpesaError('Unable to authenticate with M-Pesa. Please try again shortly.');}
}
// STK query may report an in-progress transaction with a non-zero result code.
export const processingDescription = /still (?:under )?processing|being processed|processing in progress/i;
export function isProcessingResult(code: unknown, description: unknown) {
 return String(code) === '4999' || (typeof description === 'string' && processingDescription.test(description));
}
export async function queryMpesa(checkoutId:string){
 const config=mpesaConfig();const token=await accessToken(config);
 try{
  const response=await fetch(config.base+'/mpesa/stkpushquery/v1/query',{
   method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},
   body:JSON.stringify({...credentials(config),CheckoutRequestID:checkoutId}),
   cache:'no-store',signal:AbortSignal.timeout(8000)
  });
  const data=await response.json();
  if(response.ok && data.ResultCode!==undefined && data.ResultCode!==null){
   const code=String(data.ResultCode);
   if(isProcessingResult(code,data.ResultDesc))return {state:'pending',code,message:'M-Pesa is still processing your payment. We will keep checking; do not pay again.'} as const;
   return {state:code==='0'?'paid':'failed',code,message:data.ResultDesc||'Payment was not completed.'} as const;
  }
  // An unsuccessful status lookup is not proof that the payment failed.
  return {state:'pending',code:String(data.errorCode||response.status),message:'Waiting for M-Pesa to confirm your payment. Do not pay again.'} as const;
 }catch{return {state:'pending',code:'unavailable',message:'Payment confirmation is delayed. Do not pay again.'} as const;}
}

// Original send-and-confirm flow used by checkout.
export async function initiateMpesa(phone: number, price: number) {
    const config = mpesaConfig();
    phone = Number(normalizePhone(phone));
    const auth = Buffer.from(process.env.MPESA_CONSUMER_KEY + ':' + process.env.MPESA_CONSUMER_SECRET).toString('base64');
    let accessToken;
    const shortcode = config.shortcode;
    const passkey = config.passkey;
    const timestamp = await generateTimeStamp();
    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');

    const res1 = await fetch(config.base+'/oauth/v1/generate?grant_type=client_credentials',{
        headers:{
            'Authorization': `Basic ${auth}`,
        }
    });

    const response = await res1.json();
    accessToken=response.access_token;

    const res2 = await fetch(config.base+'/mpesa/stkpush/v1/processrequest', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "BusinessShortCode": config.shortcode,
            "Password": password,
            "Timestamp": timestamp,
            "TransactionType": "CustomerPayBillOnline",
            "Amount": config.testAmount ?? price,
            "PartyA": phone,
            "PartyB": config.shortcode,
            "PhoneNumber": phone,
            "CallBackURL": config.callback,
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


    const body = await confirmPayment(accessToken,password,timestamp,response2.CheckoutRequestID);
    const b2 = {
        processed:true,
        ResultCode:body.ResultCode,
        ResultDesc:body.ResultDesc
    }

    return b2;


}

const confirmPayment=async(accessToken:string,password:string,timestamp:string,CheckoutRequestID:string)=>{
    const res = await fetch(mpesaConfig().base+'/mpesa/stkpushquery/v1/query',{
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body:JSON.stringify({
            "BusinessShortCode":mpesaConfig().shortcode,
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


return timestamp;
}
