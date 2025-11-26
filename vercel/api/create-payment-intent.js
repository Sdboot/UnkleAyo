import { createPaymentIntent } from '../../api/payment.js'

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Call the payment intent handler
    return await createPaymentIntent(req, res)
  } catch (error) {
    console.error('API Error:', error)
    return res.status(500).json({
      success: false,
      message: 'Internal server error: ' + error.message
    })
  }
}
