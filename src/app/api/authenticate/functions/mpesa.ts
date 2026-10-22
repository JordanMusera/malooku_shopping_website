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
let tokenCache:{key:string;value:string;expiresAt:number}|null=null;
let tokenRequest:{key:string;promise:Promise<string>}|null=null;
async function accessToken(config:ReturnType<typeof mpesaConfig>):Promise<string>{
 const key=config.base+':'+process.env.MPESA_CONSUMER_KEY+':'+process.env.MPESA_CONSUMER_SECRET;
 if(tokenCache?.key===key && tokenCache.expiresAt>Date.now())return tokenCache.value;
 if(tokenRequest?.key===key)return tokenRequest.promise;
 const promise=(async()=>{
  try{
   const response=await fetch(config.base+'/oauth/v1/generate?grant_type=client_credentials',{headers:{Authorization:'Basic '+Buffer.from(process.env.MPESA_CONSUMER_KEY+':'+process.env.MPESA_CONSUMER_SECRET).toString('base64')},cache:'no-store',signal:AbortSignal.timeout(8000)});
   const data=await response.json();
   if(!response.ok || typeof data.access_token!=='string')throw Error();
   const lifetime=Number(data.expires_in);const seconds=Number.isFinite(lifetime)&&lifetime>60?Math.min(lifetime-60,3000):300;
   tokenCache={key,value:data.access_token,expiresAt:Date.now()+seconds*1000};
   return data.access_token as string;
  }catch{throw new MpesaError('Unable to authenticate with M-Pesa. Please try again shortly.');}
 })();
 tokenRequest={key,promise};
 try{return await promise;}finally{if(tokenRequest?.promise===promise)tokenRequest=null;}
}
export async function startMpesa(phone:string,amount:number,callbackUrl?:string){
 const config=mpesaConfig();const token=await accessToken(config);
 let response:Response;
 try{response=await fetch(config.base+'/mpesa/stkpush/v1/processrequest',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({...credentials(config),TransactionType:process.env.MPESA_TRANSACTION_TYPE||'CustomerPayBillOnline',Amount:amount,PartyA:phone,PartyB:config.shortcode,PhoneNumber:phone,CallBackURL:callbackUrl||config.callback,AccountReference:'Malooku',TransactionDesc:'Malooku'}),signal:AbortSignal.timeout(12000)});}catch{throw new MpesaError('M-Pesa has not confirmed whether the request was sent. Do not pay again; contact the store if a prompt arrives.',true);}
 if(response.status===401 || response.status===403)tokenCache=null;
 let data;try{data=await response.json();}catch{throw new MpesaError('M-Pesa returned an unreadable response. Do not retry payment yet.',true);}
 if(!response.ok || String(data.ResponseCode)!=='0' || !data.CheckoutRequestID)throw new MpesaError(data.errorMessage||data.ResponseDescription||'M-Pesa could not send the request. Please try again.');
 return {checkoutId:String(data.CheckoutRequestID),merchantRequestId:typeof data.MerchantRequestID==='string'?data.MerchantRequestID:undefined};
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
  if(response.status===401 || response.status===403)tokenCache=null;
  if(response.ok && data.ResultCode!==undefined && data.ResultCode!==null){
   const code=String(data.ResultCode);
   if(isProcessingResult(code,data.ResultDesc))return {state:'pending',code,message:'M-Pesa is still processing your payment. We will keep checking; do not pay again.'} as const;
   if(code==='2001')return {state:'pending',code,retryAfterMs:30000,message:'M-Pesa could not authenticate the status lookup. Payment is unconfirmed; do not pay again.'} as const;
   return {state:code==='0'?'paid':'failed',code,message:data.ResultDesc||'Payment was not completed.'} as const;
  }
  // An unsuccessful status lookup is not proof that the payment failed.
  return {state:'pending',code:String(data.errorCode||response.status),retryAfterMs:response.status===429?30000:15000,message:typeof data.errorMessage==='string' && /does not exist/i.test(data.errorMessage)?'M-Pesa cannot find this transaction reference. This is not a payment confirmation. Do not pay again; contact the store if money was deducted.':'M-Pesa status lookup is unavailable. We will retry; do not pay again.'} as const;
 }catch{return {state:'pending',code:'unavailable',retryAfterMs:15000,message:'Payment confirmation is delayed. Do not pay again.'} as const;}
}
