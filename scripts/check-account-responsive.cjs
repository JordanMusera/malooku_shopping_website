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
  const product = await mongoose.connection.collection('products').findOne({});
  await mongoose.connection.collection('orders').insertOne({userId:String(userId),products:[{product:{...product,title:'Everyday Backpack with a deliberately long product title for narrow phone layouts'},quantity:1,productQtyPrice:product.price}],totalCost:product.price,status:'pending',orderDate:'2026-10-22',shippingAddress:{city:'Nairobi',county:'Nairobi',street:'Example Avenue'},paymentMethod:{accType:'mpesa'}});
  await mongoose.connection.collection('wishlists').insertOne({userId:String(userId),wishlist:[{productId:String(product._id)}]});
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
  async function navigate(label) {
    await evaluate(`(() => {
      const select = document.querySelector('#account-section-select');
      if (getComputedStyle(select.parentElement).display !== 'none') {
        const option = Array.from(select.options).find(o=>o.textContent === ${JSON.stringify(label)});
        select.value = option.value;
        select.dispatchEvent(new Event('change', {bubbles:true}));
      } else Array.from(document.querySelectorAll('.account-menu button')).find(b=>b.textContent.includes(${JSON.stringify(label)})).click();
    })()`);
  }
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
  for (const width of [320,360,390,430,768,1024,1440]) {
    await send('Emulation.setDeviceMetricsOverride',{width,height:950,deviceScaleFactor:1,mobile:width<1024});
    for (const [label,heading] of [['Personal information','Personal information'],['My orders','My orders'],['Saved items','Saved items'],['Reviews','Your reviews'],['Notifications','Notifications'],['Security','Account security']]) {
      await navigate(label);
      await until(`document.querySelector('#account-section-title')?.textContent === ${JSON.stringify(heading)}`);
      if(label==='Personal information') await until('!!document.querySelector("#profile-name")');
      if(label==='My orders') await until('!!document.querySelector(".account-order")');
      if(label==='Saved items') await until('!!document.querySelector(".account-saved-grid .product-card")');
      await evaluate('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');
      const metrics=await evaluate('JSON.stringify({viewport:innerWidth,body:document.documentElement.scrollWidth,navWidth:document.querySelector(".account-menu").scrollWidth,navClient:document.querySelector(".account-menu").clientWidth,buttons:Array.from(document.querySelectorAll(".account-menu button")).map(b=>({left:b.getBoundingClientRect().left,right:b.getBoundingClientRect().right,height:b.getBoundingClientRect().height}))})');
      const layout=JSON.parse(metrics);
      assert.ok(layout.body <= width,`${width}px ${label} overflow: ${metrics}`);
      if (width > 1000) assert.ok(layout.navWidth<=layout.navClient+1,`${width}px clipped navigation`);
      if (width > 1000) assert.ok(layout.buttons.every(b=>b.left>=0 && b.right<=width && b.height>=44));
      else assert.ok(await evaluate('document.querySelector("#account-section-select").getBoundingClientRect().width > 200 && document.querySelector("#account-section-select").options.length === 6'));
      if(label==='Personal information' && width<=430) {
        assert.ok(await evaluate('parseFloat(getComputedStyle(document.querySelector("#profile-name")).fontSize)>=16'));
      }
      if ([360,768,1440].includes(width) && ['Personal information','My orders'].includes(label)) {
        await evaluate('window.scrollTo({top:0,behavior:"instant"})');
        await screenshot(`account-responsive-${width}-${label==='My orders'?'orders':'profile'}.png`);
      }
    }
    await navigate('My orders');
    await until('!!document.querySelector(".account-order-actions")');
    await navigate('Reviews');
    await until('!!document.querySelector(".review-category-tabs")');
    await evaluate('window.scrollTo({top:0,behavior:"instant"}); window.reviewTabsUnderTest = document.querySelector(".review-category-tabs"); true');
    const reviewTabs = await evaluate('JSON.stringify(Array.from(document.querySelectorAll(".review-category-tabs button")).map(b=>({text:b.textContent,x:b.getBoundingClientRect().x,y:b.getBoundingClientRect().y,width:b.getBoundingClientRect().width,height:b.getBoundingClientRect().height})))');
    for(const category of ['Reviewed','Pending','Reviewed','Pending']) {
      await evaluate(`Array.from(document.querySelectorAll('.review-category-tabs button')).find(b=>b.textContent===${JSON.stringify(category)}).click()`);
      await until(`document.querySelector('.review-category-tabs [aria-current=page]')?.textContent === ${JSON.stringify(category)}`);
      assert.equal(await evaluate('document.querySelector(".review-category-tabs") === window.reviewTabsUnderTest'),true);
      assert.equal(await evaluate('document.querySelector("#account-section-title").textContent'),'Your reviews');
      assert.equal(await evaluate('document.querySelector("#account-section-select").value'),'pending_review_tab');
      assert.equal(await evaluate('JSON.stringify(Array.from(document.querySelectorAll(".review-category-tabs button")).map(b=>({text:b.textContent,x:b.getBoundingClientRect().x,y:b.getBoundingClientRect().y,width:b.getBoundingClientRect().width,height:b.getBoundingClientRect().height})))'),reviewTabs);
    }
    await navigate('My orders');
    await until('!!document.querySelector(".account-order-actions")');
    await evaluate('window.scrollTo({top:0,behavior:"instant"}); window.orderTabsUnderTest = document.querySelector(".order-category-tabs"); true');
    const originalTabs = await evaluate('JSON.stringify(Array.from(document.querySelectorAll(".order-category-tabs button")).map(b=>({text:b.textContent,x:b.getBoundingClientRect().x,y:b.getBoundingClientRect().y,width:b.getBoundingClientRect().width,height:b.getBoundingClientRect().height})))');
    for(const category of ['Cancelled','Refunds','All orders','Refunds','All orders']) {
      await evaluate(`Array.from(document.querySelectorAll('.order-category-tabs button')).find(b=>b.textContent===${JSON.stringify(category)}).click()`);
      await until(`document.querySelector('.order-category-tabs [aria-current=page]')?.textContent === ${JSON.stringify(category)}`);
      assert.equal(await evaluate('document.querySelector(".order-category-tabs") === window.orderTabsUnderTest'),true);
      assert.equal(await evaluate('document.querySelector("#account-section-title").textContent'),'My orders');
      assert.equal(await evaluate('document.querySelector("#account-section-select").value'),'ordersTab');
      assert.equal(await evaluate('JSON.stringify(Array.from(document.querySelectorAll(".order-category-tabs button")).map(b=>({text:b.textContent,x:b.getBoundingClientRect().x,y:b.getBoundingClientRect().y,width:b.getBoundingClientRect().width,height:b.getBoundingClientRect().height})))'),originalTabs);
    }
    await until('!!document.querySelector(".account-order-actions")');
    await evaluate('document.querySelector(".account-order-actions button").click()');
    await until('document.querySelector("#account-section-title")?.textContent === "Order details"');
    await evaluate('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');
    assert.ok(await evaluate('document.documentElement.scrollWidth')<=width,`${width}px order details overflow`);
    console.log(`PASS: ${width}px — all six account sections, menu visibility, and no horizontal overflow.`);
  }
 } finally {
  if(send)await send('Browser.close').catch(()=>{});
  ws?.close();
  await mongoose.connection.collection('orders').deleteMany({userId:String(userId)});
  await mongoose.connection.collection('wishlists').deleteMany({userId:String(userId)});
  await mongoose.connection.collection('users').deleteOne({_id:userId});
  await mongoose.disconnect();
 }
}
main().catch(error=>{console.error(error);process.exitCode=1});