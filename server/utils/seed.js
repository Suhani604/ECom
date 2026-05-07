import 'dotenv/config'
import mongoose from 'mongoose'
import bcrypt   from 'bcryptjs'

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/Ecom'

const userSchema = new mongoose.Schema({
  name: String, email: { type: String, unique: true },
  phone: { type: String, unique: true }, password: String,
  role: { type: String, default: 'buyer' },
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  sellerDetails: { type: Object, default: {} },
}, { timestamps: true })

const categorySchema = new mongoose.Schema({
  name: String, slug: { type: String, unique: true },
  parent: { type: String, default: null },
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
}, { timestamps: true })

const User     = mongoose.models.User     || mongoose.model('User',     userSchema)
const Category = mongoose.models.Category || mongoose.model('Category', categorySchema)

const categories = [
  { name: 'Men',   slug: 'men',   parent: null },
  { name: 'Women', slug: 'women', parent: null },
  { name: 'Kids',  slug: 'kids',  parent: null },
  { name: 'T-Shirts',      slug: 'men-tshirts',    parent: 'men'   },
  { name: 'Shirts',        slug: 'men-shirts',     parent: 'men'   },
  { name: 'Jeans',         slug: 'men-jeans',      parent: 'men'   },
  { name: 'Kurtas',        slug: 'men-kurtas',     parent: 'men'   },
  { name: 'Jackets',       slug: 'men-jackets',    parent: 'men'   },
  { name: 'Kurtis',        slug: 'women-kurtis',   parent: 'women' },
  { name: 'Sarees',        slug: 'women-sarees',   parent: 'women' },
  { name: 'Tops',          slug: 'women-tops',     parent: 'women' },
  { name: 'Dresses',       slug: 'women-dresses',  parent: 'women' },
  { name: 'Jeans',         slug: 'women-jeans',    parent: 'women' },
  { name: 'Ethnic Wear',   slug: 'women-ethnic',   parent: 'women' },
  { name: 'Boys Clothing',  slug: 'kids-boys',     parent: 'kids'  },
  { name: 'Girls Clothing', slug: 'kids-girls',    parent: 'kids'  },
  { name: 'Baby Clothing',  slug: 'kids-baby',     parent: 'kids'  },
  { name: 'School Uniform', slug: 'kids-uniform',  parent: 'kids'  },
  { name: 'Party Wear',     slug: 'kids-party',    parent: 'kids'  },
]

const testUsers = [
  {
    name: 'Super Admin', email: 'admin@garments.com',
    phone: '9999999999', password: 'Admin@1234',
    role: 'admin', isVerified: true, isActive: true,
  },
  {
    name: 'Test Buyer', email: 'buyer@garments.com',
    phone: '8888888888', password: 'Buyer@1234',
    role: 'buyer', isVerified: true, isActive: true,
  },
  {
    name: 'Test Seller', email: 'seller@garments.com',
    phone: '7777777777', password: 'Seller@1234',
    role: 'seller', isVerified: true, isActive: true,
    sellerDetails: {
      businessName: 'Fashion Hub',
      businessType: 'individual',
      gstin:        '27AAPFU0939F1ZV',
      pan:          'AAPFU0939F',
      bankName:     'State Bank of India',
      accountHolder:'Test Seller',
      accountNumber:'123456789012',
      ifscCode:     'SBIN0001234',
      pickupAddress: {
        line1: 'Shop 12, MG Road', city: 'Pune',
        state: 'Maharashtra', pincode: '411001',
        contactName: 'Test Seller', contactPhone: '7777777777',
      },
      approvalStatus:     'approved',
      onboardingStep:     5,
      onboardingComplete: true,
    },
  },
]

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI)
    console.log('\n🌱  Connected to MongoDB\n')

    // ── Users ─────────────────────────────────────────────────────────────────
    for (const u of testUsers) {
      const exists = await User.findOne({ email: u.email })
      if (exists) {
        console.log(`⏭   ${u.role} already exists: ${u.email}`)
        continue
      }
      const hashed = await bcrypt.hash(u.password, 12)
      await User.create({ ...u, password: hashed })
      console.log(`✅  ${u.role} created: ${u.email}  |  password: ${u.password}`)
    }

    // ── Categories ────────────────────────────────────────────────────────────
    for (const cat of categories) {
      await Category.findOneAndUpdate({ slug: cat.slug }, cat, { upsert: true, new: true })
    }
    console.log(`\n✅  ${categories.length} categories seeded`)

    console.log('\n🎉  Seed complete!\n')
    console.log('═══════════════════════════════════════')
    console.log('  LOGIN CREDENTIALS')
    console.log('═══════════════════════════════════════')
    console.log('  Admin:  admin@garments.com  / Admin@1234')
    console.log('  Buyer:  buyer@garments.com  / Buyer@1234')
    console.log('  Seller: seller@garments.com / Seller@1234')
    console.log('═══════════════════════════════════════\n')
    process.exit(0)
  } catch (err) {
    console.error('❌  Seed failed:', err.message)
    process.exit(1)
  }
}

seed()