import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

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

export default async function handler(req, res) {
  console.log('📧 /api/confirm-payment endpoint called')
  console.log('Method:', req.method)
  console.log('Body:', req.body)
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    console.log('❌ Method not allowed:', req.method)
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: 'Method not allowed. Only POST is supported.' })
  }

  try {
    const { paymentIntentId, paymentMethod, name, email, phone, date, time, currency, amount, adminEmail } = req.body

    // Validate required fields
    if (!paymentIntentId || !name || !email || !date || !time) {
      console.log('❌ Missing required fields')
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: paymentIntentId, name, email, date, time' 
      })
    }

    console.log('✅ Validation passed, processing bank transfer...')

    const formattedDate = new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    const bankDetails = getBankDetailsForCurrency(currency)

    if (!bankDetails) {
      console.log('❌ Bank details not found for currency:', currency)
      return res.status(400).json({
        success: false,
        message: `Bank details not available for currency: ${currency}`
      })
    }

    console.log('📧 Sending emails...')
    console.log('User email to:', email)
    console.log('Admin email to:', adminEmail || process.env.ADMIN_EMAIL || 'salakodeborah234@gmail.com')

    // Send confirmation email to user
    const userEmailResult = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: `✅ Meeting Confirmed - ${formattedDate} at ${time}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ff6b35;">✅ Your Meeting is Confirmed!</h2>
          <p>Hi ${name},</p>
          <p>Thank you for scheduling a meeting with UnkleAyo. Your meeting has been successfully confirmed!</p>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Meeting Details</h3>
            <p><strong>📅 Date:</strong> ${formattedDate}</p>
            <p><strong>⏰ Time:</strong> ${time}</p>
            <p><strong>📧 Email:</strong> ${email}</p>
            <p><strong>📱 Phone:</strong> ${phone}</p>
            <p><strong>📝 Reference:</strong> ${paymentIntentId.slice(-8).toUpperCase()}</p>
          </div>

          <p>You will receive a meeting link via email before the scheduled time.</p>
          <p>If you have any questions, please don't hesitate to reach out.</p>
          <p>Best regards,<br>UnkleAyo Team</p>
        </div>
      `
    })

    console.log('✅ User email sent:', userEmailResult)

    const adminEmail_ = adminEmail || process.env.ADMIN_EMAIL || 'salakodeborah234@gmail.com'
    const adminEmailResult = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: adminEmail_,
      subject: `📅 New Meeting Scheduled - ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ff6b35;">📅 New Meeting Confirmed</h2>
          
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
            <p><strong>✅ Status:</strong> Meeting Confirmed</p>
            <p><strong>📝 Reference:</strong> ${paymentIntentId}</p>
          </div>

          <p style="color: #666; font-size: 12px;">The customer has booked a meeting. This is an automated message from UnkleAyo website.</p>
        </div>
      `
    })

    console.log('✅ Admin email sent:', adminEmailResult)

    return res.status(200).json({
      success: true,
      message: 'Meeting scheduled successfully! Confirmation emails sent to you and the admin.',
      paymentIntentId,
      paymentMethod: 'bank_transfer'
    })
  } catch (error) {
    console.error('❌ Error in confirm-payment handler:', error.message)
    console.error('Full error:', error)
    return res.status(500).json({
      success: false,
      message: 'Internal server error: ' + error.message
    })
  }
}
