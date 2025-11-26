import { confirmPayment } from '../../api/payment.js'

export default async function handler(req, res) {
  console.log('📧 /api/confirm-payment endpoint called')
  console.log('Method:', req.method)
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    console.log('❌ Method not allowed:', req.method)
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    console.log('📧 Calling confirmPayment function')
    // Call the payment confirmation handler
    return await confirmPayment(req, res)
  } catch (error) {
    console.error('❌ API Error:', error.message)
    console.error('Full error:', error)
    return res.status(500).json({
      success: false,
      message: 'Internal server error: ' + error.message
    })
  }
}
