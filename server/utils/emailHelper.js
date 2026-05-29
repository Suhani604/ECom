import nodemailer from 'nodemailer'

const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return null
  }
  return nodemailer.createTransport({
    host:   process.env.EMAIL_HOST   || 'smtp.gmail.com',
    port:   Number(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth:   { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  })
}

export const sendOTPEmail = async (toEmail, name, otp, purpose = 'verify') => {
  const transporter = createTransporter()

  // If email not configured — just log OTP to console (dev mode)
  if (!transporter) {
    console.log(`\n📧  OTP for ${toEmail}: ${otp}  (email not configured)\n`)
    return
  }

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

  await transporter.sendMail({
    from:    `"KidsMenWomen" <${process.env.EMAIL_USER}>`,
    to:      toEmail,
    subject: subjects[purpose] || subjects.verify,
    html,
  })
}
// ADD this at the bottom of your existing emailHelper.js

export const sendOutForDeliveryEmail = async (toEmail, name, orderId, trackingUrl) => {
  const transporter = createTransporter()

  if (!transporter) {
    console.log(`\n📦  Order ${orderId} is OUT FOR DELIVERY for ${toEmail}  (email not configured)\n`)
    return
  }

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#fff;border-radius:12px;border:1px solid #e8e6e0">
      <h2 style="color:#ec4899;margin:0 0 8px">KidsMenWomen</h2>
      <p style="color:#444;margin:0 0 16px;font-size:14px">Hi ${name},</p>

      <div style="background:#fdf2f8;border-radius:10px;padding:20px;margin:0 0 24px;text-align:center">
        <div style="font-size:48px;margin-bottom:8px">🚚</div>
        <h3 style="color:#ec4899;margin:0 0 6px;font-size:20px">Your order is on the way!</h3>
        <p style="color:#666;font-size:14px;margin:0">Order <strong>#${orderId}</strong> is out for delivery today.</p>
      </div>

      <p style="color:#444;font-size:14px;margin:0 0 20px">
        Please keep your phone handy — our delivery partner will arrive shortly.
      </p>

      <div style="text-align:center;margin:0 0 24px">
        <a href="${trackingUrl}"
           style="background:#ec4899;color:#fff;padding:14px 32px;border-radius:10px;text-decoration:none;font-size:15px;font-weight:700;display:inline-block">
          📍 Track My Order
        </a>
      </div>

      <p style="color:#888;font-size:12px;margin:0;text-align:center">
        Estimated delivery: <strong>Today</strong>. Do not share your OTP with anyone.
      </p>
    </div>
  `

  await transporter.sendMail({
    from:    `"KidsMenWomen" <${process.env.EMAIL_USER}>`,
    to:      toEmail,
    subject: `🚚 Your order #${orderId} is out for delivery!`,
    html,
  })
}