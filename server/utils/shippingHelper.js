// server/utils/shippingHelper.js
// All rates sourced from VogueCart_Shipping_Master.xlsx

// ─── Weight Slabs ─────────────────────────────────────────────────────────────
const WEIGHT_SLABS = [
  { maxG: 500,   forwardMin: 40,  forwardMax: 55,  reverseMin: 60,  reverseMax: 80  },
  { maxG: 1000,  forwardMin: 60,  forwardMax: 80,  reverseMin: 85,  reverseMax: 110 },
  { maxG: 1500,  forwardMin: 85,  forwardMax: 110, reverseMin: 115, reverseMax: 145 },
  { maxG: 2000,  forwardMin: 115, forwardMax: 145, reverseMin: 150, reverseMax: 185 },
  { maxG: 3000,  forwardMin: 155, forwardMax: 195, reverseMin: 200, reverseMax: 245 },
  { maxG: 5000,  forwardMin: 210, forwardMax: 265, reverseMin: 270, reverseMax: 320 },
  { maxG: 10000, forwardMin: 290, forwardMax: 380, reverseMin: 360, reverseMax: 450 },
]

// ─── Courier Rates ────────────────────────────────────────────────────────────
// deliveryDays is now an object per zone (was a string before — caused the bug
// in orderController where courierData.deliveryDays[zone] returned undefined)
export const COURIER_RATES = {
  bluedart: {
    label: 'Bluedart',
    deliveryDays: { sameCity: 1, metro: 2, nonMetro: 3, remote: 5 },
    zones: {
      sameCity: { baseFee: 40,  commission: 0.08,  codFlat: 25, codRate: 0.015 },
      metro:    { baseFee: 55,  commission: 0.09,  codFlat: 30, codRate: 0.017 },
      nonMetro: { baseFee: 70,  commission: 0.10,  codFlat: 35, codRate: 0.019 },
      remote:   { baseFee: 110, commission: 0.12,  codFlat: 50, codRate: 0.021 },
    },
  },
  delhivery: {
    label: 'Delhivery',
    deliveryDays: { sameCity: 2, metro: 3, nonMetro: 4, remote: 6 },
    zones: {
      sameCity: { baseFee: 35,  commission: 0.07,  codFlat: 22, codRate: 0.015 },
      metro:    { baseFee: 50,  commission: 0.08,  codFlat: 28, codRate: 0.017 },
      nonMetro: { baseFee: 65,  commission: 0.095, codFlat: 32, codRate: 0.019 },
      remote:   { baseFee: 100, commission: 0.11,  codFlat: 45, codRate: 0.021 },
    },
  },
  ekart: {
    label: 'Ekart',
    deliveryDays: { sameCity: 2, metro: 3, nonMetro: 5, remote: 7 },
    zones: {
      sameCity: { baseFee: 32,  commission: 0.065, codFlat: 20, codRate: 0.015 },
      metro:    { baseFee: 45,  commission: 0.075, codFlat: 25, codRate: 0.017 },
      nonMetro: { baseFee: 60,  commission: 0.09,  codFlat: 30, codRate: 0.019 },
      remote:   { baseFee: 95,  commission: 0.11,  codFlat: 42, codRate: 0.021 },
    },
  },
  xpressbees: {
    label: 'Xpressbees',
    deliveryDays: { sameCity: 2, metro: 3, nonMetro: 5, remote: 7 },
    zones: {
      sameCity: { baseFee: 34,  commission: 0.07,  codFlat: 22, codRate: 0.015 },
      metro:    { baseFee: 48,  commission: 0.08,  codFlat: 27, codRate: 0.017 },
      nonMetro: { baseFee: 62,  commission: 0.09,  codFlat: 31, codRate: 0.019 },
      remote:   { baseFee: 92,  commission: 0.105, codFlat: 40, codRate: 0.021 },
    },
  },
}

// ─── Reverse Logistics ────────────────────────────────────────────────────────
const REVERSE_CHARGES = {
  sameCity: { base: 70,  pickupFee: 20, qcFee: 12 },
  metro:    { base: 97,  pickupFee: 25, qcFee: 12 },
  nonMetro: { base: 132, pickupFee: 30, qcFee: 17 },
  remote:   { base: 185, pickupFee: 40, qcFee: 17 },
}

// ─── Private helpers ──────────────────────────────────────────────────────────

function roundToSlab(totalWeightG) {
  const effective = Math.max(totalWeightG, 100)
  return Math.ceil(effective / 500) * 500
}

function getWeightSlab(roundedWeightG) {
  return WEIGHT_SLABS.find((s) => roundedWeightG <= s.maxG) || WEIGHT_SLABS[WEIGHT_SLABS.length - 1]
}

function resolveCourier(courierInput) {
  const key = (courierInput || '').toLowerCase().replace(/[^a-z]/g, '')
  if (COURIER_RATES[key]) return key
  const found = Object.keys(COURIER_RATES).find((k) => k.startsWith(key.slice(0, 4)))
  return found || 'delhivery'
}

// ─── detectZone ───────────────────────────────────────────────────────────────
export function detectZone(buyerPincode, sellerPincode) {
  const METRO_PINCODES  = ['110', '400', '500', '600', '700', '560', '380']
  const REMOTE_PINCODES = ['19', '18', '17', '37']

  const buyerPrefix3  = String(buyerPincode).slice(0, 3)
  const sellerPrefix3 = String(sellerPincode).slice(0, 3)
  const buyerPrefix2  = String(buyerPincode).slice(0, 2)

  if (REMOTE_PINCODES.includes(buyerPrefix2)) return 'remote'
  if (buyerPrefix3 === sellerPrefix3)          return 'sameCity'

  const buyerIsMetro  = METRO_PINCODES.includes(buyerPrefix3)
  const sellerIsMetro = METRO_PINCODES.includes(sellerPrefix3)

  if (buyerIsMetro && sellerIsMetro) return 'metro'
  if (!buyerIsMetro)                 return 'nonMetro'
  return 'metro'
}

// ─── getCheapestCourier ───────────────────────────────────────────────────────
export function getCheapestCourier(zone) {
  let bestKey = 'delhivery'
  let bestFee = Infinity

  for (const [key, data] of Object.entries(COURIER_RATES)) {
    const fee = data.zones[zone]?.baseFee ?? Infinity
    if (fee < bestFee) {
      bestFee = fee
      bestKey = key
    }
  }
  return bestKey
}

// ─── calculateShipping ────────────────────────────────────────────────────────
export function calculateShipping({
  itemWeightG,
  packagingWeightG       = 0,
  zone                   = 'metro',
  courier                = 'delhivery',
  isCOD                  = false,
  sellingPrice,
  platformCommissionRate = null,
}) {
  const courierKey  = resolveCourier(courier)
  const courierData = COURIER_RATES[courierKey]
  const zoneRates   = courierData.zones[zone]

  if (!zoneRates) {
    throw new Error(`Invalid zone "${zone}". Use: sameCity, metro, nonMetro, remote`)
  }

  const totalWeightG   = itemWeightG + packagingWeightG
  const roundedWeightG = roundToSlab(totalWeightG)
  const slab           = getWeightSlab(roundedWeightG)

  const shippingFee        = Math.round((slab.forwardMin + slab.forwardMax) / 2)
  const commissionRate     = platformCommissionRate ?? zoneRates.commission
  const platformCommission = Math.round(sellingPrice * commissionRate)

  let codCharge = 0
  if (isCOD) {
    const codByPercent = Math.round(sellingPrice * zoneRates.codRate)
    codCharge = Math.max(zoneRates.codFlat, codByPercent)
  }

  const gstOnShipping     = Math.round(shippingFee * 0.18)
  const paymentGatewayFee = isCOD ? 0 : Math.round(sellingPrice * 0.015)

  const deliveryDays = courierData.deliveryDays[zone] || 4
  const deliveryDate = new Date(Date.now() + deliveryDays * 86400000)
    .toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })

  const totalDeducted      = shippingFee + platformCommission + codCharge + gstOnShipping + paymentGatewayFee
  const sellerPayout       = sellingPrice - totalDeducted
  const effectiveMarginPct = parseFloat(((sellerPayout / sellingPrice) * 100).toFixed(1))

  return {
    itemWeightG, packagingWeightG, totalWeightG, roundedWeightG,
    zone,
    courier:             courierKey,
    courierLabel:        courierData.label,
    deliveryDays,
    deliveryDate,
    isCOD,
    sellingPrice,
    shippingFee,
    platformCommission,
    commissionRate,
    codCharge,
    gstOnShipping,
    paymentGatewayFee,
    totalDeducted,
    sellerPayout,
    effectiveMarginPct,
  }
}

// ─── calculateReverseShipping ─────────────────────────────────────────────────
export function calculateReverseShipping(zone = 'metro') {
  const charges = REVERSE_CHARGES[zone]
  if (!charges) throw new Error(`Invalid zone "${zone}" for reverse shipping`)

  const total = charges.base + charges.pickupFee + charges.qcFee
  return {
    zone,
    base:         charges.base,
    pickupFee:    charges.pickupFee,
    qcFee:        charges.qcFee,
    total,
    totalReverse: total,
    deductedFrom: 'sellerPayout',
  }
}