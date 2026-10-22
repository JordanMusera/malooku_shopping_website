const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('@next/env').loadEnvConfig(process.cwd());
async function main() {
 assert.ok(process.env.MONGODB_URI?.startsWith('mongodb://127.0.0.1:27017/'));
 await mongoose.connect(process.env.MONGODB_URI);
 const userId = new mongoose.Types.ObjectId();
 const email = `account-check-${crypto.randomUUID()}@example.test`;
 const password = crypto.randomBytes(24).toString('hex');
 let send, ws;
 try {
  await mongoose.connection.collection('users').insertOne({_id:userId,username:'Maya Demo',email,password:await bcrypt.hash(password,10),role:'user',phone:254700000000,address:{city:'Nairobi',county:'Nairobi',street:'Sample Street'}});
  const login = await fetch('http://localhost:3000/api/authenticate/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({userEmail:email,userPassword:password})});
  assert.equal((await login.json()).success,true);
  const token = login.headers.get('set-cookie').split(';')[0].slice('authToken='.length);
  let targets;
  for(let n=0;n<50;n++){try{targets=await(await fetch('http://127.0.0.1:9238/json')).json();break;}catch{await new Promise(r=>setTimeout(r,100));}}
  ws = new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl);
  await new Promise(resolve=>ws.addEventListener('open',resolve,{once:true}));
  let id=0;const pending=new Map();
  ws.addEventListener('message',e=>{const data=JSON.parse(e.data);if(data.id){const p=pending.get(data.id);pending.delete(data.id);data.error?p.reject(data.error):p.resolve(data.result);}});
  send=(method,params={})=>new Promise((resolve,reject)=>{const key=++id;pending.set(key,{resolve,reject});ws.send(JSON.stringify({id:key,method,params}));});
  const evaluate=async expression=>(await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true})).result.value;
  const until=async expression=>{for(let n=0;n<150;n++){if(await evaluate(expression))return;await new Promise(r=>setTimeout(r,100));}throw new Error('UI check timed out');};
  await send('Network.setCookie',{name:'authToken',value:token,url:'http://localhost:3000',path:'/',httpOnly:true,sameSite:'Strict'});
  await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1100,deviceScaleFactor:1,mobile:false});
  await send('Page.navigate',{url:'http://localhost:3000/account'});
  await until('document.querySelector("#profile-name")?.value === "Maya Demo"');
  await evaluate('(() => { const input=document.querySelector("#profile-name"); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,"value").set.call(input,"Maya Updated"); input.dispatchEvent(new Event("input",{bubbles:true})); })()');
  await evaluate('document.querySelector(".account-profile-form button[type=submit]").click()');
  await until('document.querySelector(".account-form-actions")?.textContent.includes("Your changes have been saved")');
  assert.equal((await mongoose.connection.collection('users').findOne({_id:userId})).fullname,'Maya Updated');
  console.log('PASS: profile form saves the full name to MongoDB.');
  const output=path.join(process.env.TEMP,'malooku-ui-review');
  async function screenshot(name){fs.writeFileSync(path.join(output,name),Buffer.from((await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false})).data,'base64'));}
  await screenshot('account-desktop.png');
  await send('Emulation.setDeviceMetricsOverride',{width:390,height:1100,deviceScaleFactor:1,mobile:true});
  assert.equal(await evaluate('document.documentElement.scrollWidth'),390);
  await screenshot('account-mobile.png');
  for(const [label,heading] of [['My orders','My orders'],['Saved items','Saved items'],['Security','Account security']]) {
   await evaluate(`Array.from(document.querySelectorAll('.account-menu button')).find(b=>b.textContent.includes(${JSON.stringify(label)})).click()`);
   await until(`document.querySelector('#account-section-title')?.textContent === ${JSON.stringify(heading)}`);
   if(label==='My orders')await until('document.querySelector(".account-empty h3")?.textContent.includes("Your next find")');
   if(label==='Saved items')await until('document.querySelector(".account-empty h3")?.textContent.includes("A place for")');
   assert.equal(await evaluate('document.documentElement.scrollWidth'),390);
   console.log(`PASS: ${label} navigation and mobile layout.`);
  }
 } finally {
  if(send)await send('Browser.close').catch(()=>{});
  ws?.close();
  await mongoose.connection.collection('users').deleteOne({_id:userId});
  await mongoose.disconnect();
 }
}
main().catch(error=>{console.error(error);process.exitCode=1});