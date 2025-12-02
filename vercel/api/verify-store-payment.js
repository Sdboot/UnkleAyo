const https = require('https');

function verifyWithPaystack(reference) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.paystack.co',
      port: 443,
      path: `/transaction/verify/${reference}`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { reference, fullName, email, phone, items, totalAmount } = req.body;

    if (!reference) {
      return res.status(400).json({ 
        success: false,
        message: 'Payment reference is required' 
      });
    }

    // Verify with Paystack
    const paystackResponse = await verifyWithPaystack(reference);

    if (!paystackResponse.status || paystackResponse.data.status !== 'success') {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }

    const paymentData = paystackResponse.data;
    const itemsList = items.map(item => `${item.quantity}x ${item.name} - ₦${(item.price * item.quantity).toLocaleString()}`).join('\n');

    // Send customer order confirmation via Formspree
    const customerFormData = {
      email,
      name: fullName,
      phone,
      order_items: itemsList,
      total_amount: (paymentData.amount / 100).toFixed(2),
      reference: paymentData.reference,
      message: `Order Confirmation\n\nDear ${fullName},\n\nThank you for your order!\n\nOrder Details:\n${itemsList}\n\nTotal Amount: ₦${(paymentData.amount / 100).toFixed(2)}\nPayment Reference: ${paymentData.reference}\nStatus: ${paymentData.status}\n\nYour products will be sent to this email shortly.\n\nThank you for shopping at UnkleAyo Store!`,
      _subject: `✅ Order Confirmed - Reference ${paymentData.reference}`,
      _template: 'table',
      _replyto: email
    };

    try {
      await fetch('https://formspree.io/f/mblnyale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerFormData)
      });
      console.log('✅ Customer order confirmation email sent');
    } catch (err) {
      console.error('Error sending customer email:', err);
    }

    // Send admin notification via Formspree
    const adminFormData = {
      email: 'salakodeborah234@gmail.com',
      customer_name: fullName,
      customer_email: email,
      phone,
      order_items: itemsList,
      total_amount: (paymentData.amount / 100).toFixed(2),
      reference: paymentData.reference,
      payment_status: paymentData.status,
      message: `New Store Order - Payment Received\n\nCustomer Name: ${fullName}\nCustomer Email: ${email}\nPhone: ${phone}\n\nOrder Items:\n${itemsList}\n\nTotal Amount: ₦${(paymentData.amount / 100).toFixed(2)}\nPayment Status: ${paymentData.status}\nPayment Reference: ${paymentData.reference}\n\nThis is an automated notification from UnkleAyo Store.`,
      _subject: `📦 New Store Order - ${fullName}`,
      _template: 'table'
    };

    try {
      await fetch('https://formspree.io/f/mblnyale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adminFormData)
      });
      console.log('✅ Admin order notification email sent');
    } catch (err) {
      console.error('Error sending admin email:', err);
    }

    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        reference: paymentData.reference,
        amount: paymentData.amount / 100,
        status: paymentData.status
      }
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Payment verification failed'
    });
  }
}
