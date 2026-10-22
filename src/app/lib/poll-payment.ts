import {readPaymentResponse} from './payment-response';

function pause(ms:number,signal:AbortSignal){
 return new Promise<void>((resolve,reject)=>{
  const abort=()=>{clearTimeout(timer);signal.removeEventListener('abort',abort);reject(new DOMException('Aborted','AbortError'));};
  const timer=setTimeout(()=>{signal.removeEventListener('abort',abort);resolve();},ms);
  signal.addEventListener('abort',abort,{once:true});
  if(signal.aborted)abort();
 });
}

export async function pollPaymentStatus(paymentId:string,options:{signal:AbortSignal;onPending:(message:string)=>void;intervalMs?:number;fetcher?:typeof fetch}){
 const fetcher=options.fetcher||fetch;
 while(!options.signal.aborted){
  try{
   const response=await fetcher('/api/orders?paymentId='+encodeURIComponent(paymentId),{cache:'no-store',signal:options.signal});
   if(response.status===401||response.status===403)return {success:false,pending:true,message:'Sign in again to resume checking this payment.'};
   if(response.status===404)return {success:false,pending:true,message:'Payment reference not found. Contact the store before paying again.'};
   const data=await readPaymentResponse(response);
   if(response.ok && (data.success || data.pending===false))return data;
   options.onPending(typeof data.message==='string'?data.message:'Waiting for M-Pesa confirmation. Checking again shortly.');
  }catch(error){
   if(options.signal.aborted)throw error;
   options.onPending('Confirmation is temporarily unavailable. We are still checking the same payment; do not pay again.');
  }
  await pause(options.intervalMs??5000,options.signal);
 }
 throw new DOMException('Aborted','AbortError');
}
