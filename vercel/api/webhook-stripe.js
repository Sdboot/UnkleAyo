import { handleStripeWebhook } from '../../api/payment.js'

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Call the webhook handler
    return await handleStripeWebhook(req, res)
  } catch (error) {
    console.error('Webhook Error:', error)
    return res.status(500).json({ error: 'Webhook processing failed' })
  }
}
