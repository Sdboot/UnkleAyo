import Stripe from 'stripe'
import { Resend } from 'resend'
import dotenv from 'dotenv'

dotenv.config()

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const resend = new Resend(process.env.RESEND_API_KEY)

// Create a payment intent for the meeting
export async function createPaymentIntent(req, res) {
  try {
    const { name, email, phone, date, time, currency, amount, calEventId } = req.body

    if (!name || !email || !amount) {
      return res.status(400).json({ success: false, message: 'Missing required fields' })
    }

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      metadata: {
        name,
        email,
        phone,
        date,
        time,
        calEventId
      },
      receipt_email: email
    })

    return res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    })
  } catch (error) {
    console.error('Error creating payment intent:', error)
    return res.status(500).json({
      success: false,
      message: 'Error creating payment'
    })
  }
}

// Confirm payment and create Cal.com event
export async function confirmPayment(req, res) {
  try {
    const { paymentIntentId, name, email, phone, date, time } = req.body

    if (!paymentIntentId || !name || !email || !date || !time) {
      return res.status(400).json({ success: false, message: 'Missing required fields' })
    }

    // Retrieve payment intent to verify it's succeeded
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        success: false,
        message: 'Payment not completed'
      })
    }

    // Format date and time for email
    const formattedDate = new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    // Send confirmation emails
    try {
      // Email to user
      await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: email,
        subject: `✅ Meeting Confirmed - ${formattedDate} at ${time}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #ff6b35;">✅ Your Meeting is Confirmed!</h2>
            <p>Hi ${name},</p>
            <p>Your payment has been received and your meeting has been successfully scheduled.</p>
            
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>📅 Date:</strong> ${formattedDate}</p>
              <p><strong>⏰ Time:</strong> ${time}</p>
              <p><strong>📧 Confirmation Email:</strong> ${email}</p>
              <p><strong>📱 Phone:</strong> ${phone}</p>
            </div>

            <p>You will receive a meeting link via email before the scheduled time.</p>
            <p>Best regards,<br>UnkleAyo Team</p>
          </div>
        `
      })

      // Email to admin
      await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: process.env.ADMIN_EMAIL,
        subject: `📅 New Meeting Scheduled - ${name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #ff6b35;">📅 New Meeting Scheduled</h2>
            
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Customer Information</h3>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Phone:</strong> ${phone}</p>
            </div>

            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Meeting Details</h3>
              <p><strong>📅 Date:</strong> ${formattedDate}</p>
              <p><strong>⏰ Time:</strong> ${time}</p>
              <p><strong>✅ Payment Status:</strong> Confirmed</p>
              <p><strong>💳 Payment ID:</strong> ${paymentIntentId}</p>
            </div>

            <p style="color: #666; font-size: 12px;">This is an automated message from UnkleAyo website.</p>
          </div>
        `
      })
    } catch (emailError) {
      console.error('Email sending error:', emailError)
      // Don't fail the request if email fails
    }

    return res.status(200).json({
      success: true,
      message: 'Meeting scheduled successfully! Check your email for confirmation.',
      paymentIntentId
    })
  } catch (error) {
    console.error('Error confirming payment:', error)
    return res.status(500).json({
      success: false,
      message: 'Error confirming payment'
    })
  }
}

// Handle Stripe webhook
export async function handleStripeWebhook(req, res) {
  const sig = req.headers['stripe-signature']
  let event

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (error) {
    console.error('Webhook error:', error.message)
    return res.status(400).json({ error: error.message })
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      console.log('✅ Payment succeeded:', event.data.object)
      break
    case 'payment_intent.payment_failed':
      console.log('❌ Payment failed:', event.data.object)
      break
    default:
      console.log(`Unhandled event type ${event.type}`)
  }

  res.json({ received: true })
}
