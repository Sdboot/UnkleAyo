const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { paymentMethodId, name, email, phone, date, time, amount, currency } = req.body;

    if (!paymentMethodId || !name || !email || !amount) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Create payment intent with automatic confirmation
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // Already in cents
      currency: currency || 'usd',
      payment_method: paymentMethodId,
      confirm: true,
      return_url: `${process.env.VERCEL_URL || 'https://unkle-ayo.vercel.app'}/`,
      metadata: {
        name,
        email,
        phone,
        date,
        time
      },
      receipt_email: email,
      description: `Meeting with UnkleAyo - ${date} at ${time}`
    });

    // Send confirmation email via Formspree
    const formattedDate = new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const customerFormData = {
      email,
      name,
      phone,
      date: formattedDate,
      time,
      amount: amount / 100,
      currency: currency.toUpperCase(),
      reference: paymentIntent.id,
      message: `Payment Confirmation\n\nDear ${name},\n\nYour payment of $${(amount / 100).toFixed(2)} has been received!\n\nMeeting Details:\nDate: ${formattedDate}\nTime: ${time}\nPhone: ${phone}\nPayment Reference: ${paymentIntent.id}\n\nThank you for booking with us!`,
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
    } catch (err) {
      console.error('Error sending customer email:', err);
    }

    // Send admin notification
    const adminFormData = {
      email: 'salakodeborah234@gmail.com',
      name,
      customer_email: email,
      phone,
      date: formattedDate,
      time,
      amount: amount / 100,
      currency: currency.toUpperCase(),
      reference: paymentIntent.id,
      payment_status: paymentIntent.status,
      message: `New Meeting Booking (Card Payment)\n\nCustomer Name: ${name}\nCustomer Email: ${email}\nPhone: ${phone}\n\nPayment Details:\nAmount: $${(amount / 100).toFixed(2)}\nStatus: ${paymentIntent.status}\nReference: ${paymentIntent.id}\n\nMeeting Details:\nDate: ${formattedDate}\nTime: ${time}\n\nThis is an automated notification from UnkleAyo website.`,
      _subject: `📅 New Meeting Booked - Card Payment`,
      _template: 'table'
    };

    try {
      await fetch('https://formspree.io/f/mblnyale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adminFormData)
      });
    } catch (err) {
      console.error('Error sending admin email:', err);
    }

    return res.status(200).json({
      success: true,
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status,
      message: 'Payment processed successfully'
    });
  } catch (error) {
    console.error('Payment processing error:', error);

    // Handle specific Stripe errors
    if (error.type === 'StripeCardError') {
      return res.status(400).json({
        success: false,
        message: `Card declined: ${error.message}`
      });
    }

    if (error.type === 'StripeInvalidRequestError') {
      return res.status(400).json({
        success: false,
        message: `Invalid payment details: ${error.message}`
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || 'Payment processing failed'
    });
  }
}
