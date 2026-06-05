import axios from 'axios'

export const sendOTPSMS = async (phone, otp) => {
  try {
    await axios.post(
      'https://www.fast2sms.com/dev/bulkV2',
      {
        variables_values: otp,
        route: 'otp',
        numbers: phone,
      },
      {
        headers: {
          authorization: process.env.FAST2SMS_API_KEY,
        },
      }
    )
    return true
  } catch (err) {
    console.error('SMS error:', err.message)
    return false
  }
}