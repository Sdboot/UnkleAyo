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
    const { reference, name, email, phone, date, time } = req.body;

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

    // Format date for email
    const formattedDate = new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Send customer confirmation email via Formspree
    const customerFormData = {
      email,
      name,
      phone,
      date: formattedDate,
      time,
      amount: (paymentData.amount / 100).toFixed(2),
      currency: paymentData.currency.toUpperCase(),
      reference: paymentData.reference,
      message: `Payment Confirmation\n\nDear ${name},\n\nYour payment of ₦${(paymentData.amount / 100).toFixed(2)} has been received!\n\nMeeting Details:\nDate: ${formattedDate}\nTime: ${time}\nPhone: ${phone}\nPayment Reference: ${paymentData.reference}\n\nThank you for booking with us! You will receive a meeting link shortly.`,
      _subject: `✅ Payment Received - Meeting Confirmed`,
      _template: 'table',
      _replyto: email
    };

    try {
      await fetch('https://formspree.io/f/mblnyale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerFormData)
      });
      console.log('✅ Customer confirmation email sent');
    } catch (err) {
      console.error('Error sending customer email:', err);
    }

    // Send admin notification email via Formspree
    const adminFormData = {
      email: 'salakodeborah234@gmail.com',
      name,
      customer_email: email,
      phone,
      date: formattedDate,
      time,
      amount: (paymentData.amount / 100).toFixed(2),
      currency: paymentData.currency.toUpperCase(),
      reference: paymentData.reference,
      payment_status: paymentData.status,
      message: `New Meeting Booking - Payment Received\n\nCustomer Name: ${name}\nCustomer Email: ${email}\nPhone: ${phone}\n\nPayment Details:\nAmount: ₦${(paymentData.amount / 100).toFixed(2)}\nStatus: ${paymentData.status}\nReference: ${paymentData.reference}\n\nMeeting Details:\nDate: ${formattedDate}\nTime: ${time}\n\nThis is an automated notification from UnkleAyo website.`,
      _subject: `📅 New Meeting Booked - Payment Received`,
      _template: 'table'
    };

    try {
      await fetch('https://formspree.io/f/mblnyale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adminFormData)
      });
      console.log('✅ Admin notification email sent');
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
