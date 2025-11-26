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
    const { paymentIntentId, paymentMethod, name, email, phone, date, time, currency, amount } = req.body

    if (!paymentIntentId || !name || !email || !date || !time) {
      return res.status(400).json({ success: false, message: 'Missing required fields' })
    }

    // Handle different payment methods
    if (paymentMethod === 'bank_transfer') {
      // For bank transfers, we don't need to verify with Stripe
      // Just log and send confirmation emails
      return handleBankTransferConfirmation(res, { paymentIntentId, name, email, phone, date, time, currency, amount })
    }

    // Original card payment flow
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
              <p><strong>✅ Payment Status:</strong> Card Payment Confirmed</p>
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

// Handle bank transfer confirmation
async function handleBankTransferConfirmation(res, data) {
  try {
    const { paymentIntentId, name, email, phone, date, time, currency, amount } = data

    const formattedDate = new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    // Get bank details from currencyConfig
    const bankDetails = getBankDetailsForCurrency(currency)

    if (!bankDetails) {
      return res.status(400).json({
        success: false,
        message: 'Bank details not available for selected currency'
      })
    }

    // Send bank transfer details email to user
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: `💳 Complete Your Bank Transfer - Meeting Reference ${paymentIntentId.slice(-8).toUpperCase()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ff6b35;">💳 Complete Your Bank Transfer</h2>
          <p>Hi ${name},</p>
          <p>Thank you for scheduling a meeting with UnkleAyo! To confirm your booking, please complete the bank transfer using the details below.</p>
          
          <div style="background: #fff3f0; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff6b35;">
            <h3 style="color: #ff6b35; margin-top: 0;">Bank Transfer Details</h3>
            <p><strong>Bank Name:</strong> ${bankDetails.bankName}</p>
            <p><strong>Account Name:</strong> ${bankDetails.accountName}</p>
            <p><strong>Account Number:</strong> <span style="font-family: monospace; background: #f0f0f0; padding: 2px 6px;">${bankDetails.accountNumber}</span></p>
            ${bankDetails.iban ? `<p><strong>IBAN:</strong> <span style="font-family: monospace; background: #f0f0f0; padding: 2px 6px;">${bankDetails.iban}</span></p>` : ''}
            ${bankDetails.swiftCode ? `<p><strong>SWIFT Code:</strong> <span style="font-family: monospace; background: #f0f0f0; padding: 2px 6px;">${bankDetails.swiftCode}</span></p>` : ''}
            ${bankDetails.sortCode ? `<p><strong>Sort Code:</strong> <span style="font-family: monospace; background: #f0f0f0; padding: 2px 6px;">${bankDetails.sortCode}</span></p>` : ''}
            ${bankDetails.routingNumber ? `<p><strong>Routing Number:</strong> <span style="font-family: monospace; background: #f0f0f0; padding: 2px 6px;">${bankDetails.routingNumber}</span></p>` : ''}
            ${bankDetails.ifscCode ? `<p><strong>IFSC Code:</strong> <span style="font-family: monospace; background: #f0f0f0; padding: 2px 6px;">${bankDetails.ifscCode}</span></p>` : ''}
            ${bankDetails.bsb ? `<p><strong>BSB:</strong> <span style="font-family: monospace; background: #f0f0f0; padding: 2px 6px;">${bankDetails.bsb}</span></p>` : ''}
            ${bankDetails.branchCode ? `<p><strong>Branch Code:</strong> <span style="font-family: monospace; background: #f0f0f0; padding: 2px 6px;">${bankDetails.branchCode}</span></p>` : ''}
            ${bankDetails.bankCode ? `<p><strong>Bank Code:</strong> <span style="font-family: monospace; background: #f0f0f0; padding: 2px 6px;">${bankDetails.bankCode}</span></p>` : ''}
          </div>

          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Transfer Details</h3>
            <p><strong>💰 Amount:</strong> ${amount} ${currency}</p>
            <p><strong>📝 Reference/Description:</strong> ${name} - ${paymentIntentId.slice(-8).toUpperCase()}</p>
            <p><strong>📅 Meeting Date:</strong> ${formattedDate}</p>
            <p><strong>⏰ Meeting Time:</strong> ${time}</p>
          </div>

          <div style="background: #fffbf0; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;">
            <p style="margin: 0; color: #856404;"><strong>⚠️ Important:</strong> Please use your name as the reference/description for the transfer so we can identify your payment.</p>
          </div>

          <p>Once we receive your payment, your meeting will be confirmed and you'll receive a meeting link via email.</p>
          <p>If you have any questions, please don't hesitate to reach out.</p>
          <p>Best regards,<br>UnkleAyo Team</p>
        </div>
      `
    })

    // Send notification email to admin
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: process.env.ADMIN_EMAIL,
      subject: `📅 Bank Transfer Pending - ${name} (${currency})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ff6b35;">📅 Bank Transfer Pending</h2>
          
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
            <p><strong>💰 Amount:</strong> ${amount} ${currency}</p>
            <p><strong>⏳ Payment Status:</strong> Pending Bank Transfer</p>
            <p><strong>📝 Reference:</strong> ${paymentIntentId}</p>
          </div>

          <p style="color: #666; font-size: 12px;">Awaiting payment confirmation. This is an automated message from UnkleAyo website.</p>
        </div>
      `
    })

    return res.status(200).json({
      success: true,
      message: 'Bank transfer details sent to your email. Please complete the transfer to confirm your meeting.',
      paymentIntentId,
      paymentMethod: 'bank_transfer'
    })
  } catch (error) {
    console.error('Error handling bank transfer:', error)
    return res.status(500).json({
      success: false,
      message: 'Error processing bank transfer request'
    })
  }
}

// Helper function to get bank details for currency
function getBankDetailsForCurrency(currency) {
  const bankDetails = {
    USD: {
      bankName: 'Chase Bank',
      accountName: 'UnkleAyo',
      accountNumber: '1234567890',
      swiftCode: 'CHASUS33',
      routingNumber: '021000021'
    },
    EUR: {
      bankName: 'Deutsche Bank',
      accountName: 'UnkleAyo',
      accountNumber: 'DE89370400440532013000',
      swiftCode: 'DEUTDE',
      iban: 'DE89370400440532013000'
    },
    GBP: {
      bankName: 'Barclays Bank UK',
      accountName: 'UnkleAyo',
      accountNumber: '41926819',
      swiftCode: 'BARCGB22',
      sortCode: '20-26-97'
    },
    CAD: {
      bankName: 'Royal Bank of Canada',
      accountName: 'UnkleAyo',
      accountNumber: '0062123456789',
      swiftCode: 'ROYCCA2S',
      routingNumber: '000026009'
    },
    AUD: {
      bankName: 'Commonwealth Bank',
      accountName: 'UnkleAyo',
      accountNumber: '123456789',
      swiftCode: 'CTBKAU2S',
      bsb: '062-126'
    },
    JPY: {
      bankName: 'Tokyo Bank',
      accountName: 'UnkleAyo',
      accountNumber: '1234567',
      swiftCode: 'TOKYJ',
      branchCode: '100'
    },
    INR: {
      bankName: 'HDFC Bank',
      accountName: 'UnkleAyo',
      accountNumber: '0123456789012345',
      swiftCode: 'HDFCINBB',
      ifscCode: 'HDFC0000001'
    },
    NGN: {
      bankName: 'First Bank Nigeria',
      accountName: 'UnkleAyo',
      accountNumber: '1234567890',
      swiftCode: 'FBNGNG',
      bankCode: '011'
    },
    ZAR: {
      bankName: 'Standard Bank',
      accountName: 'UnkleAyo',
      accountNumber: '123456789',
      swiftCode: 'SBZAZAJJ',
      branchCode: '051001'
    },
    MXN: {
      bankName: 'Banco Azteca',
      accountName: 'UnkleAyo',
      accountNumber: '0123456789',
      swiftCode: 'AZTAMXMX',
      bankCode: '127'
    }
  }

  return bankDetails[currency] || null
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
