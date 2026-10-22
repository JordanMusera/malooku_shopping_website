// Dry run by default. --apply copies existing attempts into the payments ledger.
// This never queries M-Pesa, sends a push, or changes an attempt's payment state.
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.resolve(__dirname, '..');
require('@next/env').loadEnvConfig(root);
const mongoose = require('mongoose'), ts = require('typescript');
const compiled = ts.transpileModule(fs.readFileSync(path.join(root, 'src/app/models/payments.ts'), 'utf8'), {
 compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true}
}).outputText;
const ledger = {exports: {}};
vm.runInThisContext('(function(require,module,exports){' + compiled + '\n})')(require, ledger, ledger.exports);
(async () => {
 try {
  await mongoose.connect(process.env.MONGODB_URI, {serverSelectionTimeoutMS: 15000});
  const collection = mongoose.connection.collection('paymentattempts');
  const before = await mongoose.connection.collection('payments').countDocuments();
  const states = {};
  let count = 0;
  for await (const attempt of collection.find({})) {
   states[attempt.state] = (states[attempt.state] || 0) + 1;
   if (process.argv.includes('--apply')) await ledger.exports.recordPayment(attempt);
   count++;
  }
  console.log(JSON.stringify({database: mongoose.connection.name, attempts: count, states,
   paymentsBefore: before, paymentsAfter: await mongoose.connection.collection('payments').countDocuments(),
   applied: process.argv.includes('--apply')}));
 } catch (error) {
  console.error('Payment backfill failed:', error.code || error.name);
  process.exitCode = 1;
 } finally { await mongoose.disconnect(); }
})();
