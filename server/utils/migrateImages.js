import mongoose from 'mongoose'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { v2 as cloudinary } from 'cloudinary'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)

// ✅ Hardcoded — bypasses dotenv issue entirely
const MONGO_URI             = 'mongodb://localhost:27017/Ecom'
const CLOUDINARY_CLOUD_NAME = 'dcin4dgza'
const CLOUDINARY_API_KEY    = '116793155717526'
const CLOUDINARY_API_SECRET = 'G3z4KOsBnd5U99nVTmYkKIwAJW8'

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key:    CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
})

// ── Minimal Product model ─────────────────────────────────────────────────────
const Product = mongoose.model('Product', new mongoose.Schema({
  title:  String,
  images: [String],
}))

// ── Connect ───────────────────────────────────────────────────────────────────
console.log('🔌 Connecting to MongoDB...')
await mongoose.connect(MONGO_URI)
console.log('✅ Connected!\n')

// ── Find products with localhost URLs ─────────────────────────────────────────
const products = await Product.find({
  images: { $elemMatch: { $regex: 'localhost' } }
})
console.log(`📦 Found ${products.length} products with local images\n`)

if (products.length === 0) {
  console.log('🎉 Nothing to migrate — all images already on Cloudinary!')
  await mongoose.disconnect()
  process.exit(0)
}

let successCount = 0
let failCount    = 0

for (const product of products) {
  console.log(`\n🔄 Processing: "${product.title}"`)
  const newUrls = []

  for (const imgUrl of product.images) {
    if (imgUrl.includes('localhost')) {
      const filename  = imgUrl.split('/uploads/')[1]
      const localPath = path.join(__dirname, '../uploads', filename)

      if (fs.existsSync(localPath)) {
        try {
          const result = await cloudinary.uploader.upload(localPath, {
            folder: 'voguecart/products',
          })
          newUrls.push(result.secure_url)
          console.log(`  ✅ ${filename}`)
          console.log(`     → ${result.secure_url}`)
          successCount++
        } catch (err) {
          console.error(`  ❌ Failed: ${filename} — ${err.message}`)
          newUrls.push(imgUrl)
          failCount++
        }
      } else {
        console.warn(`  ⚠️  File not on disk: ${filename}`)
        newUrls.push(imgUrl)
        failCount++
      }
    } else {
      newUrls.push(imgUrl)
      console.log(`  ⏭️  Already Cloudinary URL`)
    }
  }

  product.images = newUrls
  await product.save()
  console.log(`  💾 Saved: "${product.title}"`)
}

console.log('\n─────────────────────────────────────')
console.log(`🎉 Migration complete!`)
console.log(`   ✅ Uploaded: ${successCount} images`)
console.log(`   ❌ Failed:   ${failCount} images`)
console.log('─────────────────────────────────────')
await mongoose.disconnect()