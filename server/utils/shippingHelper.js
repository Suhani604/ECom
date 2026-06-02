// server/utils/shippingHelper.js
// ─────────────────────────────────────────────────────────────
//  All rates fetched from DB (Courier + PlatformCharges models)
//  No hardcoded rate tables.
// ─────────────────────────────────────────────────────────────
import { Courier, PlatformCharges } from '../models/ShippingConfig.js'

// ══════════════════════════════════════════════════════════════
// ZONE DETECTION  (no geolocation — purely pincode prefix)
// ══════════════════════════════════════════════════════════════

// Metro city pincode prefixes (first 3 digits)
const METRO_PREFIXES = new Set([
  // Mumbai 400xxx
  '400',
  // Delhi / New Delhi 110xxx
  '110',
  // Bengaluru 560xxx
  '560',
  // Chennai 600xxx
  '600',
  // Hyderabad 500xxx
  '500',
  // Kolkata 700xxx
  '700',
  // Pune 411xxx
  '411',
  // Ahmedabad 380xxx
  '380',
])

// Remote / difficult area pincode prefixes
const REMOTE_PREFIXES = new Set([
  '193', '194', '195', // J&K high altitude
  '172', '175',        // Himachal remote
  '737',               // Sikkim
  '744',               // Andaman
  '682', '683',        // Lakshadweep area
])

export function detectZone(buyerPin = '', sellerPin = '') {
  const b = String(buyerPin).trim()
  const s = String(sellerPin).trim()
  if (!b || b.length !== 6) return 'nonMetro'

  // Same first 3 digits = sameCity
  if (b.slice(0, 3) === s.slice(0, 3)) return 'sameCity'

  // Remote check
  if (REMOTE_PREFIXES.has(b.slice(0, 3))) return 'remote'

  // Metro check
  if (METRO_PREFIXES.has(b.slice(0, 3))) return 'metro'

  return 'nonMetro'
}

// ══════════════════════════════════════════════════════════════
// CHARGEABLE WEIGHT
// ══════════════════════════════════════════════════════════════
export function chargeableWeight({ itemWeightG = 500, packagingWeightG = 60, l = 0, w = 0, h = 0 }) {
  const actual     = itemWeightG + packagingWeightG
  const volumetric = l && w && h ? (l * w * h) / 5 : 0   // cm³ / 5 = grams (standard)
  return Math.max(actual, volumetric)
}

// ══════════════════════════════════════════════════════════════
// CHEAPEST COURIER  (from DB, active only)
// ══════════════════════════════════════════════════════════════
export async function getCheapestCourier(zone) {
  const couriers = await Courier.find({ isActive: true })
  if (!couriers.length) throw new Error('No active couriers in DB')

  let best = null
  let bestRate = Infinity

  for (const c of couriers) {
    const zoneData = c.zones?.[zone]
    if (!zoneData) continue
    if (zoneData.upTo500g < bestRate) {
      bestRate = zoneData.upTo500g
      best = c
    }
  }
  return best || couriers[0]
}

// ══════════════════════════════════════════════════════════════
// CALCULATE SHIPPING  (main function — all from DB)
// ══════════════════════════════════════════════════════════════
export async function calculateShipping({
  itemWeightG      = 500,
  packagingWeightG = 60,
  l = 0, w = 0, h = 0,
  zone             = 'nonMetro',
  courierKey       = null,   // pass null → auto pick cheapest
  isCOD            = false,
  sellingPrice     = 0,
}) {
  // ── Load courier ──────────────────────────────────────────
  let courier
  if (courierKey) {
    courier = await Courier.findOne({ key: courierKey, isActive: true })
  }
  if (!courier) {
    courier = await getCheapestCourier(zone)
  }

  const zoneData = courier.zones?.[zone]
  if (!zoneData) throw new Error(`Zone "${zone}" not found for courier "${courier.key}"`)

  // ── Weight & base rate ────────────────────────────────────
  const weightG    = chargeableWeight({ itemWeightG, packagingWeightG, l, w, h })
  const slabs      = Math.ceil(weightG / 500)            // 1 slab = 500g
  const shippingFee = zoneData.upTo500g + Math.max(0, slabs - 1) * zoneData.per500gExtra

  // ── Platform charges from DB ──────────────────────────────
  const pc = await PlatformCharges.findOne({ key: 'default' })
  if (!pc) throw new Error('PlatformCharges config missing in DB')

  // ── COD charge ────────────────────────────────────────────
  let codCharge = 0
  if (isCOD) {
    const byPercent = Math.round(sellingPrice * courier.codChargePercent / 100)
    codCharge = Math.max(courier.codChargeFlat, byPercent) + pc.codHandlingFlat
  }

  // ── Platform commission ───────────────────────────────────
  const platformCommission = Math.round(sellingPrice * pc.commissionPercent / 100)

  // ── GST on shipping ───────────────────────────────────────
  const gstOnShipping = Math.round(shippingFee * pc.gstOnShippingPercent / 100)

  // ── Payment gateway fee (only for prepaid) ────────────────
  const paymentGatewayFee = isCOD
    ? 0
    : Math.round(sellingPrice * pc.paymentGatewayPercent / 100)

  // ── TDS ───────────────────────────────────────────────────
  const tds = Math.round(sellingPrice * pc.tdsPercent / 100)

  // ── Total deducted from seller ────────────────────────────
  const totalDeducted = shippingFee + gstOnShipping + platformCommission + codCharge + paymentGatewayFee + tds

  // ── Seller payout ─────────────────────────────────────────
  const sellerPayout = Math.max(0, sellingPrice - totalDeducted)

  // ── Effective margin ──────────────────────────────────────
  const effectiveMarginPct = sellingPrice > 0
    ? +((platformCommission / sellingPrice) * 100).toFixed(2)
    : 0

  // ── Delivery date ─────────────────────────────────────────
  const deliveryDays = zoneData.deliveryDays
  const deliveryDate = new Date(Date.now() + deliveryDays * 86_400_000)
    .toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })

  return {
    courierKey:         courier.key,
    courierLabel:       courier.label,
    zone,
    weightG,
    shippingFee,
    codCharge,
    platformCommission,
    gstOnShipping,
    paymentGatewayFee,
    tds,
    totalDeducted,
    sellerPayout,
    effectiveMarginPct,
    deliveryDays,
    deliveryDate,
    holdPeriodDays:     pc.holdPeriodDays,
  }
}

// ══════════════════════════════════════════════════════════════
// REVERSE SHIPPING  (returns)
// ══════════════════════════════════════════════════════════════
export async function calculateReverseShipping(zone = 'nonMetro') {
  const courier = await getCheapestCourier(zone)
  const zoneData = courier.zones?.[zone]
  const base     = zoneData?.upTo500g || 55
  const reverse  = Math.round(base * 1.2)   // 20% surcharge for reverse

  const pc = await PlatformCharges.findOne({ key: 'default' })
  const gst = Math.round(reverse * (pc?.gstOnShippingPercent || 18) / 100)

  return {
    base,
    reverse,
    gst,
    total:   reverse + gst,
    courier: courier.label,
  }
}