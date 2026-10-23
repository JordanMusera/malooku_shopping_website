const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = process.cwd();
const req = require('node:module').createRequire(root + '/package.json');
const ts = req('typescript'), mongoose = req('mongoose'), jwt = req('jsonwebtoken');
const { NextRequest } = req('next/server');
const db = 'malooku_reviews_test_' + Date.now();
process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/' + db;
process.env.JWT_SECRET = 'isolated-order-tracking-test-only';
const cache = new Map();
function load(file) {
  file = path.resolve(file); if (!path.extname(file)) file += '.ts';
  if (cache.has(file)) return cache.get(file).exports;
  const module = { exports: {} }; cache.set(file, module);
  const localRequire = name => name.startsWith('@/') ? load(root + '/src/' + name.slice(2)) : name.startsWith('.') ? load(path.resolve(path.dirname(file), name)) : req(name);
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  vm.runInThisContext('(function(require,module,exports){' + code + '\n})', { filename: file })(localRequire, module, module.exports);
  return module.exports;
}
const request = (url, cookie = '', body) => new NextRequest('http://localhost:3000' + url, { method: body === undefined ? 'GET' : 'POST', headers: { cookie, 'Content-Type': 'application/json' }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
const json = async response => ({ status: response.status, cache: response.headers.get('Cache-Control'), body: await response.json() });

async function main() {
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
  const Review = load(root + '/src/app/models/product_review').default;
  const Purchase = load(root + '/src/app/models/purchased_product').default;
  const getRoute = load(root + '/src/app/api/review/comment/user/[productId]/route');
  const deleteRoute = load(root + '/src/app/api/review/comment/user/[productId]/[reviewId]/route');
  const owner = String(new mongoose.Types.ObjectId()), other = String(new mongoose.Types.ObjectId()), productId = String(new mongoose.Types.ObjectId());
  const cookie = 'authToken=' + jwt.sign({ userId: owner }, process.env.JWT_SECRET);
  const document = await Review.create({ productId, comments: [{ userId: owner, comment: 'First own review', rating: 4 }, { userId: owner, comment: 'Second own review', rating: 5 }, { userId: other, comment: 'Another customer', rating: 3 }] });
  const [first, second, third] = document.comments.map(comment => String(comment._id));
  await Purchase.create({ userId: owner, purchasedList: [{ productId, reviewed: true }, { productId, reviewed: true }] });
  await Purchase.create({ userId: other, purchasedList: [{ productId, reviewed: true }] });
  const get = async (id = productId, auth = cookie) => json(await getRoute.GET(request('/api/review/comment/user/' + id, auth), { params: { productId: id } }));
  const remove = async (reviewId, auth = cookie) => json(await deleteRoute.DELETE(new NextRequest('http://localhost:3000/api/review/comment/user/' + productId + '/' + reviewId, { method: 'DELETE', headers: { cookie: auth } }), { params: { productId, reviewId } }));
  let result = await get();
  assert.equal(result.status, 200); assert.equal(result.body.content.length, 2); assert.ok(result.body.content.every(comment => comment.userId === owner)); assert.match(result.cache, /no-store/);
  assert.equal((await get(productId, '')).status, 401); assert.equal((await get('invalid')).status, 400);
  assert.deepEqual((await get(String(new mongoose.Types.ObjectId()))).body.content, []);
  console.log('PASS: review details resolve the productId URL parameter, load only the current customer’s reviews, and handle empty records.');
  assert.equal((await remove(third)).status, 404); assert.equal((await remove(first, '')).status, 401); assert.equal((await remove('invalid')).status, 400);
  assert.equal((await Review.findById(document._id)).comments.length, 3);
  console.log('PASS: unauthenticated or other-customer review deletion is rejected without modifying reviews.');
  result = await remove(first); assert.equal(result.status, 200); assert.equal(result.body.content.length, 1); assert.equal(result.body.content[0]._id, second);
  assert.ok((await Purchase.findOne({ userId: owner })).purchasedList.every(item => item.reviewed));
  result = await remove(second); assert.equal(result.status, 200); assert.deepEqual(result.body.content, []);
  assert.ok((await Purchase.findOne({ userId: owner })).purchasedList.every(item => !item.reviewed));
  assert.ok((await Purchase.findOne({ userId: other })).purchasedList.every(item => item.reviewed));
  const remaining = await Review.findById(document._id); assert.equal(remaining.comments.length, 1); assert.equal(remaining.comments[0].userId, other);
  console.log('PASS: deleting your review returns only your remaining reviews and restores your purchased items to pending without changing another customer’s review.');
}
main().catch(e => { console.error(e); process.exitCode = 1; }).finally(async () => {
  if (mongoose.connection.readyState === 1) { assert.equal(mongoose.connection.name, db); assert.ok(db.startsWith('malooku_reviews_test_')); await mongoose.connection.dropDatabase(); await mongoose.disconnect(); }
  console.log('Only a temporary local test database was used. No customer reviews were modified.');
});
