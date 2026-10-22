const mongoose = require('mongoose');
const fs = require('node:fs');
const path = require('node:path');
const uri = 'mongodb://127.0.0.1:27017/malooku_db';
const samples = [
  ['Everyday Backpack', 2500, 'Bags', '<rect x="115" y="95" width="170" height="210" rx="40" fill="#527b77"/><path d="M165 100V80q35-40 70 0v20" fill="none" stroke="#315551" stroke-width="15"/><rect x="140" y="200" width="120" height="75" rx="18" fill="#86aaa3"/>'],
  ['Classic Cotton T-Shirt', 1200, 'Clothing', '<path d="M150 90l-75 50 40 65 35-20v130h100V185l35 20 40-65-75-50q-50 50-100 0" fill="#c982a1"/>'],
  ['Wireless Headphones', 3500, 'Electronics', '<path d="M105 225v-50a95 95 0 01190 0v50" fill="none" stroke="#455572" stroke-width="28"/><rect x="80" y="175" width="55" height="115" rx="25" fill="#7185a8"/><rect x="265" y="175" width="55" height="115" rx="25" fill="#7185a8"/>'],
  ['Ceramic Coffee Mug', 850, 'Home', '<path d="M260 150h35q65 65-5 110h-35" fill="none" stroke="#bd8b55" stroke-width="22"/><path d="M100 120h170v150q-85 70-170 0z" fill="#d6aa77"/><ellipse cx="185" cy="120" rx="85" ry="20" fill="#87633e"/>'],
  ['Everyday Wristwatch', 2800, 'Accessories', '<rect x="170" y="35" width="60" height="330" rx="18" fill="#856955"/><circle cx="200" cy="200" r="85" fill="#d9c499"/><circle cx="200" cy="200" r="68" fill="#fffaf0"/><path d="M200 155v45l40 25" fill="none" stroke="#584f47" stroke-width="8"/>'],
  ['Reusable Water Bottle', 950, 'Accessories', '<rect x="170" y="50" width="60" height="40" rx="8" fill="#42666c"/><rect x="145" y="85" width="110" height="245" rx="32" fill="#7cb5bc"/><path d="M165 135v135" stroke="#b5d9dd" stroke-width="12" stroke-linecap="round"/>'],
];
async function main() {
  const assetDir = path.join(__dirname, '..', 'public', 'sample-products');
  fs.mkdirSync(assetDir, { recursive: true });
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  try {
    for (const [index, [title, price, category, drawing]] of samples.entries()) {
      const slug = title.toLowerCase().replaceAll(' ', '-');
      const image = `/sample-products/${slug}.svg`;
      fs.writeFileSync(path.join(assetDir, `${slug}.svg`), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" rx="24" fill="#faf5f0"/>${drawing}<text x="200" y="385" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#85786b">SAMPLE PRODUCT</text></svg>`);
      await mongoose.connection.collection('products').updateOne({ seedKey: `local-sample-${slug}` }, { $setOnInsert: {
        id: index + 1, title, price, category, description: `Sample ${title.toLowerCase()} for local development and testing.`,
        qty: 25, image, images: [{ imageUrl: image }], specifications: [], variants: {}, wish: false,
        rating: { rate: 0, count: 0 }
      } }, { upsert: true });
    }
    console.log(`Local products: ${await mongoose.connection.collection('products').countDocuments()}`);
  } finally { await mongoose.disconnect(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });