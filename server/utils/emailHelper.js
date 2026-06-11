import fetch from 'node-fetch'

// ── Brevo HTTP API — SMTP ki jagah (Render pe SMTP blocked hai) ───────────────
const brevoSend = async (toEmail, toName, subject, html) => {
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': process.env.BREVO_API_KEY,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      sender:      { name: 'KidsMenWomen', email: 'jungharesuhani6@gmail.com' },
      to:          [{ email: toEmail, name: toName }],
      subject,
      htmlContent: html,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(JSON.stringify(error))
  }
  console.log(`✅ Email sent to ${toEmail}`)
}

// ── OTP Email ─────────────────────────────────────────────────────────────────
export const sendOTPEmail = async (toEmail, name, otp, purpose = 'verify') => {
  const subjects = {
    verify: 'Verify your KidsMenWomen account',
    login:  'Your login OTP — KidsMenWomen',
    reset:  'Reset your password — KidsMenWomen',
  }

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#fff;border-radius:12px;border:1px solid #e8e6e0">
      <h2 style="color:#ec4899;margin:0 0 8px">KidsMenWomen</h2>
      <p style="color:#444;margin:0 0 24px;font-size:14px">Hi ${name},</p>
      <p style="color:#444;font-size:14px;margin:0 0 24px">
        ${purpose === 'verify' ? 'Please verify your account with this OTP:' :
          purpose === 'reset'  ? 'Use this OTP to reset your password:' :
          'Your one-time login OTP:'}
      </p>
      <div style="background:#fdf2f8;border:2px dashed #ec4899;border-radius:10px;padding:24px;text-align:center;margin:0 0 24px">
        <span style="font-size:36px;font-weight:700;color:#ec4899;letter-spacing:10px">${otp}</span>
      </div>
      <p style="color:#888;font-size:12px;margin:0">Expires in 10 minutes. Do not share with anyone.</p>
    </div>
  `

  await brevoSend(toEmail, name, subjects[purpose] || subjects.verify, html)
}

// ── Out for Delivery Email ────────────────────────────────────────────────────
export const sendOutForDeliveryEmail = async (toEmail, name, orderId, trackingUrl) => {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#fff;border-radius:12px;border:1px solid #e8e6e0">
      <h2 style="color:#ec4899;margin:0 0 8px">KidsMenWomen</h2>
      <p style="color:#444;margin:0 0 16px;font-size:14px">Hi ${name},</p>
      <div style="background:#fdf2f8;border-radius:10px;padding:20px;margin:0 0 24px;text-align:center">
        <div style="font-size:48px;margin-bottom:8px">🚚</div>
        <h3 style="color:#ec4899;margin:0 0 6px;font-size:20px">Your order is on the way!</h3>
        <p style="color:#666;font-size:14px;margin:0">Order <strong>#${orderId}</strong> is out for delivery today.</p>
      </div>
      <div style="text-align:center;margin:0 0 24px">
        <a href="${trackingUrl}" style="background:#ec4899;color:#fff;padding:14px 32px;border-radius:10px;text-decoration:none;font-size:15px;font-weight:700;display:inline-block">
          📍 Track My Order
        </a>
      </div>
      <p style="color:#888;font-size:12px;margin:0;text-align:center">Estimated delivery: <strong>Today</strong>.</p>
    </div>
  `
  await brevoSend(toEmail, name, `🚚 Your order #${orderId} is out for delivery!`, html)
}

// ── Order Placed Email ────────────────────────────────────────────────────────
export const sendOrderPlacedEmail = async (toEmail, name, orderId, items, totalAmount) => {
  const itemsList = items.map(i =>
    `<tr>
      <td style="padding:8px;border-bottom:1px solid #f1f5f9">${i.title}</td>
      <td style="padding:8px;border-bottom:1px solid #f1f5f9;text-align:center">${i.size} · Qty:${i.quantity}</td>
      <td style="padding:8px;border-bottom:1px solid #f1f5f9;text-align:right">₹${i.sellingPrice * i.quantity}</td>
    </tr>`
  ).join('')

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#fff;border-radius:12px;border:1px solid #e8e6e0">
      <h2 style="color:#ec4899;margin:0 0 8px">StyleHub</h2>
      <p style="color:#444;font-size:14px">Hi ${name},</p>
      <div style="background:#f0fdf4;border-radius:10px;padding:20px;margin:0 0 20px;text-align:center">
        <div style="font-size:40px">🎉</div>
        <h3 style="color:#15803d;margin:8px 0">Order Placed Successfully!</h3>
        <p style="color:#666;font-size:13px;margin:0">Order ID: <strong>#${orderId.toString().slice(-8).toUpperCase()}</strong></p>
      </div>
      <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
        <thead>
          <tr style="background:#f8fafc">
            <th style="padding:8px;text-align:left;font-size:12px;color:#64748b">ITEM</th>
            <th style="padding:8px;text-align:center;font-size:12px;color:#64748b">DETAILS</th>
            <th style="padding:8px;text-align:right;font-size:12px;color:#64748b">PRICE</th>
          </tr>
        </thead>
        <tbody>${itemsList}</tbody>
      </table>
      <div style="background:#fdf2f8;border-radius:8px;padding:14px;text-align:right">
        <span style="font-size:16px;font-weight:700;color:#ec4899">Total: ₹${totalAmount}</span>
      </div>
      <p style="color:#888;font-size:12px;margin:16px 0 0;text-align:center">Thank you for shopping with StyleHub! 🛍️</p>
    </div>
  `
  await brevoSend(toEmail, name, `✅ Order Confirmed — #${orderId.toString().slice(-8).toUpperCase()}`, html)
}