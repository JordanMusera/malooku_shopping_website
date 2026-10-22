const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('@next/env').loadEnvConfig(process.cwd());

async function check() {
 const uri = process.env.MONGODB_URI;
 assert.ok(uri?.startsWith('mongodb://127.0.0.1:27017/'), 'This check only runs against local MongoDB.');
 await mongoose.connect(uri);
 const userId = new mongoose.Types.ObjectId();
 const email = `cart-check-${crypto.randomUUID()}@example.test`;
 const password = crypto.randomBytes(24).toString('hex');
 const base = 'http://localhost:3000';
 try {
  await mongoose.connection.collection('users').insertOne({_id:userId,email,password:await bcrypt.hash(password,10),role:'user'});
  for (const cookie of ['', 'authToken=invalid', `authToken=${jwt.sign({userId:String(userId)},process.env.JWT_SECRET,{expiresIn:-1})}`]) {
   const response = await fetch(`${base}/api/cart/user`,{headers:{Cookie:cookie}});
   assert.equal(response.status,401);
  }
  console.log('PASS: missing, invalid, and expired sessions return 401.');
  const login = await fetch(`${base}/api/authenticate/login`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({userEmail:email,userPassword:password})});
  assert.equal((await login.json()).success,true);
  const cookie = login.headers.get('set-cookie')?.split(';')[0];
  assert.ok(cookie?.startsWith('authToken='));
  const empty = await fetch(`${base}/api/cart/user`,{headers:{Cookie:cookie}});
  assert.equal(empty.status,200);
  assert.deepEqual(await empty.json(),{cartData:[],totalCartCost:0});
  assert.match(empty.headers.get('cache-control'),/no-store/);
  console.log('PASS: actual sign-in cookie loads an empty bag without requiring sign-in again.');
  const product = await mongoose.connection.collection('products').findOne({});
  assert.ok(product);
  const added = await fetch(`${base}/api/cart/user`,{method:'POST',headers:{Cookie:cookie,'Content-Type':'application/json'},body:JSON.stringify({productId:String(product._id),orderedQty:1,selectedProductVariants:{},selectedProductPrice:product.price})});
  assert.equal((await added.json()).success,true);
  const populated = await fetch(`${base}/api/cart/user`,{headers:{Cookie:cookie}});
  assert.equal(populated.status,200);
  const data = await populated.json();
  assert.equal(data.cartData.length,1);
  assert.equal(data.cartData[0]._id,String(product._id));
  assert.equal(data.totalCartCost,product.price);
  console.log('PASS: adding a product after sign-in returns the populated bag.');
 } finally {
  await mongoose.connection.collection('carts').deleteMany({userId:String(userId)});
  await mongoose.connection.collection('users').deleteOne({_id:userId});
  await mongoose.disconnect();
 }
}
check().catch(error=>{console.error(error);process.exitCode=1});