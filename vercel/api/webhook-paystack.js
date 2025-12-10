const crypto = require('crypto');

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const signature = req.headers['x-paystack-signature'];
    const body = req.body;

    // Verify webhook signature
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(body))
      .digest('hex');

    if (hash !== signature) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Handle different event types
    const event = body.event;
    const data = body.data;

    switch (event) {
      case 'charge.success':
        console.log('✅ Payment successful:', data.reference);
        // You can log this to a database or trigger additional actions
        // Example: Update order status in your database
        break;

      case 'charge.failed':
        console.log('❌ Payment failed:', data.reference);
        // Handle failed payment
        break;

      case 'transfer.success':
        console.log('💸 Transfer successful:', data.reference);
        // Handle successful transfer
        break;

      default:
        console.log('📬 Received event:', event);
    }

    // Always return 200 to acknowledge receipt
    return res.status(200).json({ 
      success: true,
      message: 'Webhook received successfully',
      event: event
    });
  } catch (error) {
    console.error('Webhook Error:', error);
    // Still return 200 to prevent Paystack from retrying
    return res.status(200).json({ 
      error: 'Webhook processing completed with error',
      details: error.message 
    });
  }
}
