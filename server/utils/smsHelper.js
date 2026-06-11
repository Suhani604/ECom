import axios from 'axios'

export const sendOTPSMS = async (phone, otp) => {
  try {
    await axios.post(
  'https://www.fast2sms.com/dev/bulkV2',
  {
    message: `Your OTP is ${otp}. Valid for 10 minutes.`,
    language: 'english',
    route: 'q',
    numbers: phone.toString().replace(/^\+91/, '').replace(/^91/, '').slice(-10),
  },
      {
        headers: {
          authorization: process.env.FAST2SMS_API_KEY,
        },
      }
    )
    return true
 } catch (err) {
    console.error('SMS error:', err.response?.data || err.message)
    return false
  }
}

