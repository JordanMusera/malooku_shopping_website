const mongoose = require('mongoose');
(async () => {
 await mongoose.connect('mongodb://127.0.0.1:27017/malooku_db');
 try {
  for (const slug of ['everyday-backpack','classic-cotton-t-shirt','wireless-headphones','ceramic-coffee-mug','everyday-wristwatch','reusable-water-bottle']) {
   const image = `/sample-products/${slug}.jpg`;
   await mongoose.connection.collection('products').updateOne({seedKey:`local-sample-${slug}`},{$set:{image,images:[{imageUrl:image}]}});
  }
  console.log('Updated sample product photography.');
 } finally { await mongoose.disconnect(); }
})().catch(error => {console.error(error);process.exitCode=1});