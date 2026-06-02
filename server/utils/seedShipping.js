// ─────────────────────────────────────────────────────────────
//  server/utils/seedShipping.js
//  Run SEPARATELY:  node server/utils/seedShipping.js
//
//  ✅ NEVER touches Category / Size / Color / AdditionalDetail
//  ✅ Uses upsert — safe to run multiple times
//  ✅ Only inserts Courier + PlatformCharges
// ─────────────────────────────────────────────────────────────
import 'dotenv/config'
import mongoose            from 'mongoose'
import connectDB           from '../config/db.js'
import { Courier, PlatformCharges } from '../models/ShippingConfig.js'

await connectDB()
console.log('\n🚚  Seeding shipping config only...\n')

// ── Couriers ──────────────────────────────────────────────────
const couriersToSeed = [
  {
    key:   'delhivery',
    label: 'Delhivery',
    zones: {
      sameCity: { upTo500g: 38, per500gExtra: 10, deliveryDays: 2 },
      metro:    { upTo500g: 45, per500gExtra: 12, deliveryDays: 3 },
      nonMetro: { upTo500g: 55, per500gExtra: 15, deliveryDays: 5 },
      remote:   { upTo500g: 75, per500gExtra: 20, deliveryDays: 7 },
    },
    codChargeFlat: 30, codChargePercent: 1.5, isActive: true,
  },
  {
    key:   'bluedart',
    label: 'BlueDart',
    zones: {
      sameCity: { upTo500g: 50, per500gExtra: 15, deliveryDays: 1 },
      metro:    { upTo500g: 65, per500gExtra: 18, deliveryDays: 2 },
      nonMetro: { upTo500g: 80, per500gExtra: 22, deliveryDays: 4 },
      remote:   { upTo500g: 110, per500gExtra: 30, deliveryDays: 6 },
    },
    codChargeFlat: 35, codChargePercent: 1.8, isActive: true,
  },
  {
    key:   'ekart',
    label: 'Ekart',
    zones: {
      sameCity: { upTo500g: 35, per500gExtra: 9,  deliveryDays: 2 },
      metro:    { upTo500g: 42, per500gExtra: 11, deliveryDays: 3 },
      nonMetro: { upTo500g: 50, per500gExtra: 14, deliveryDays: 5 },
      remote:   { upTo500g: 70, per500gExtra: 18, deliveryDays: 7 },
    },
    codChargeFlat: 25, codChargePercent: 1.2, isActive: true,
  },
]

for (const c of couriersToSeed) {
  const existing = await Courier.findOne({ key: c.key })
  if (existing) {
    console.log(`⏭   Courier "${c.label}" already exists — skipped`)
  } else {
    await Courier.create(c)
    console.log(`✅  Courier "${c.label}" inserted`)
  }
}

// ── Platform Charges ──────────────────────────────────────────
const existing = await PlatformCharges.findOne({ key: 'default' })
if (existing) {
  console.log('⏭   PlatformCharges already exists — skipped')
} else {
  await PlatformCharges.create({
    key:                   'default',
    commissionPercent:     9,
    gstOnShippingPercent:  18,
    paymentGatewayPercent: 2,
    codHandlingFlat:       20,
    tdsPercent:            1,
    holdPeriodDays:        10,
  })
  console.log('✅  PlatformCharges inserted')
}

console.log('\n🎉  Shipping seed done — no existing data touched!\n')
await mongoose.disconnect()
process.exit(0)