import axios from 'axios'

export const sendOTPSMS = async (phone, otp) => {
  try {
    await axios.post(
      'https://www.fast2sms.com/dev/bulkV2',
      {
        variables_values: otp,
        route: 'otp',
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