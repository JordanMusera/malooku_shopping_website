// Never show HTML error pages or a JSON parser exception as payment feedback.
export async function readPaymentResponse(response: Response): Promise<Record<string, any>> {
 const reference = 'Your payment status is unknown. Do not pay again; check its status shortly.';
 if (response.status === 401 || response.redirected) {
  throw new Error('Your session has expired. Sign in again before checking payment status.');
 }
 let data: any;
 try { data = await response.json(); } catch {
  throw new Error('The payment service returned an unreadable response (HTTP ' + response.status + '). ' + reference);
 }
 if (!data || typeof data !== 'object' || Array.isArray(data)) {
  throw new Error('The payment service returned an invalid response. ' + reference);
 }
 if (!response.ok && !data.pending) {
  throw new Error(typeof data.message === 'string' ? data.message : 'The payment service is unavailable (HTTP ' + response.status + '). ' + reference);
 }
 return data;
}
