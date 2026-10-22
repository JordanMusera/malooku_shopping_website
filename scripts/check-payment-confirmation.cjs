const fs=require('fs'),path=require('path'),assert=require('assert/strict'),vm=require('vm');const {createRequire}=require('module');const root=path.resolve(__dirname,'..');const req=createRequire(root+'/package.json');const ts=req('typescript'),mongoose=req('mongoose'),jwt=req('jsonwebtoken');const {NextRequest}=req('next/server');
const db='malooku_payment_test_'+Date.now();process.env.MONGODB_URI='mongodb://127.0.0.1:27017/'+db;process.env.JWT_SECRET='test-secret-isolated-only';Object.assign(process.env,{MPESA_ENVIRONMENT:'sandbox',MPESA_TEST_AMOUNT:'1',MPESA_SHORTCODE:'174379',MPESA_PASSKEY:'test-passkey',MPESA_CONSUMER_KEY:'test-key',MPESA_CONSUMER_SECRET:'test-secret',MPESA_CALLBACK_URL:'https://malooku-shopping-website.vercel.app/api/payments/callback'});
const cache=new Map();function load(file){file=path.resolve(file);if(!path.extname(file))file+='.ts';if(cache.has(file))return cache.get(file).exports;const module={exports:{}};cache.set(file,module);const localRequire=name=>name.startsWith('@/')?load(root+'/src/'+name.slice(2)):name.startsWith('.')?load(path.resolve(path.dirname(file),name)):req(name);const output=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText;vm.runInThisContext('(function(require,module,exports){'+output+'\n})',{filename:file})(localRequire,module,module.exports);return module.exports;}

let pushes=0,mode='paid',payload;
global.fetch=async(url,options={})=>{
 assert.ok(String(url).startsWith('https://sandbox.safaricom.co.ke/'));
 if(String(url).includes('/oauth/'))return Response.json({access_token:'test'});
 if(String(url).includes('/processrequest')){pushes++;payload=JSON.parse(options.body);return Response.json({ResponseCode:'0',CheckoutRequestID:'test-'+pushes});}
 return Response.json({ResponseCode:'0',ResultCode:mode==='paid'?0:1032,ResultDesc:mode==='paid'?'Success':'Cancelled'});
};
const userId=String(new mongoose.Types.ObjectId()),token=jwt.sign({userId},process.env.JWT_SECRET);
const body={shippingAddress:{street:'Test',city:'Nairobi',county:'Nairobi'},paymentMethod:{accType:'mpesa',accNumber:712345678}};
const request=()=>new NextRequest('http://localhost/api/orders',{method:'POST',headers:{cookie:'authToken='+token,'Content-Type':'application/json'},body:JSON.stringify(body)});
(async()=>{
 await mongoose.connect(process.env.MONGODB_URI);
 const Product=load(root+'/src/app/models/product').default,Cart=load(root+'/src/app/models/cart').default,Order=load(root+'/src/app/models/order').default;
 const route=load(root+'/src/app/api/orders/route');
 const product=await Product.create({title:'Test',price:2999,qty:10});
 const fill=()=>Cart.create({userId,products:[{productId:String(product._id),quantity:2}]});
 await fill();let result=await route.POST(request());assert.equal((await result.json()).success,true);
 assert.equal(pushes,1);assert.equal(payload.Amount,1);assert.equal(payload.PhoneNumber,254712345678);assert.equal(payload.CallBackURL,process.env.MPESA_CALLBACK_URL);
 assert.equal(await Order.countDocuments(),1);assert.equal((await Order.findOne()).totalCost,5998);assert.equal(await Cart.countDocuments(),0);
 assert.equal(await mongoose.connection.collection('paymentattempts').countDocuments(),0);
 await fill();mode='failed';result=await route.POST(request());assert.equal((await result.json()).success,false);assert.equal(await Order.countDocuments(),1);assert.equal(await Cart.countDocuments(),1);
 console.log('PASS: original send-and-confirm request, KSh 1, configured callback, normalized phone, order creation on success only, cart preserved on cancellation, no payment-attempt locks.');
})().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>{if(mongoose.connection.readyState===1){assert.equal(mongoose.connection.name,db);await mongoose.connection.dropDatabase();await mongoose.disconnect();}console.log('Only an isolated test database and mocked M-Pesa were used.');});
