const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),ts=require('typescript');
const compiled=ts.transpileModule(fs.readFileSync(require('path').join(__dirname,'../src/app/lib/payment-response.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
const loaded={exports:{}};vm.runInThisContext('(function(exports){'+compiled+'\n})')(loaded.exports);
const {readPaymentResponse}=loaded.exports;
(async()=>{
 for(const body of ['<html>Gateway timeout</html>','', 'Internal Server Error']) await assert.rejects(readPaymentResponse(new Response(body,{status:504})),/unreadable response.*HTTP 504.*Do not pay again/);
 await assert.rejects(readPaymentResponse(Response.json(null)),/invalid response/);
 await assert.rejects(readPaymentResponse(new Response('<html>Login</html>',{status:401})),/session has expired/);
 await assert.rejects(readPaymentResponse(Response.json({message:'Invalid address'},{status:400})),/Invalid address/);
 assert.equal((await readPaymentResponse(Response.json({pending:true,message:'Checking'},{status:503}))).pending,true);
 assert.equal((await readPaymentResponse(Response.json({success:true}))).success,true);
 console.log('PASS: HTML, empty bodies, malformed JSON, expired sessions, API errors, pending responses and success.');
})().catch(e=>{console.error(e);process.exitCode=1});
