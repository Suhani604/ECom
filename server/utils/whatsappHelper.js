import twilio from 'twilio'

// ── Twilio client (returns null if not configured) ─────────────────────────
const getClient = () => {
  if (!process.env.TWILIO_SID || !process.env.TWILIO_TOKEN) {
    return null
  }
  return twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN)
}

// ═══════════════════════════════════════════════════════════════════════════
// WHATSAPP — Out for delivery
// ═══════════════════════════════════════════════════════════════════════════
export const sendOutForDeliveryWhatsApp = async (toPhone, name, orderId, trackingUrl) => {
  const client = getClient()

  if (!client) {
    console.log(`\n📱  WhatsApp not configured — skipping for order ${orderId}\n`)
    return
  }

  const message = `
🚚 *KidsMenWomen*

Hi ${name}! Your order *#${orderId}* is out for delivery today.

Our delivery partner will arrive shortly. Please keep your phone handy.

📍 Track your order: ${trackingUrl}

_Do not share your OTP with anyone._
`.trim()

  await client.messages.create({
    from: process.env.TWILIO_WHATSAPP_FROM,  // whatsapp:+14155238886
    to:   `whatsapp:+91${toPhone}`,
    body: message,
  })
}

// ═══════════════════════════════════════════════════════════════════════════
// SMS — Out for delivery
// ═══════════════════════════════════════════════════════════════════════════
export const sendOutForDeliverySMS = async (toPhone, name, orderId, trackingUrl) => {
  const client = getClient()

  if (!client) {
    console.log(`\n💬  SMS not configured — skipping for order ${orderId}\n`)
    return
  }

  const message =
    `KidsMenWomen: Hi ${name}, your order #${orderId} is out for delivery today! ` +
    `Track here: ${trackingUrl}`

  await client.messages.create({
    from: process.env.TWILIO_SMS_FROM,   // your Twilio phone number
    to:   `+91${toPhone}`,
    body: message,
  })
}