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

    // Send emails
    const userEmailResult = await resend.emails.send({
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

          <p>Once we receive your payment, your meeting will be confirmed and you'll receive a meeting link via email.</p>
          <p>Best regards,<br>UnkleAyo Team</p>
        </div>
      `
    })

    console.log('✅ User email sent:', userEmailResult)

    const adminEmail_ = adminEmail || process.env.ADMIN_EMAIL || 'salakodeborah234@gmail.com'
    const adminEmailResult = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: adminEmail_,
      subject: `📅 New Meeting Scheduled - ${name} (${currency})`,
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
            <p><strong>💰 Amount:</strong> ${amount} ${currency}</p>
            <p><strong>✅ Payment Status:</strong> Payment Confirmed by Customer</p>
            <p><strong>📝 Reference:</strong> ${paymentIntentId}</p>
          </div>

          <p style="color: #666; font-size: 12px;">The customer has confirmed they have made the payment. This is an automated message from UnkleAyo website.</p>
        </div>
      `
    })

    console.log('✅ Admin email sent:', adminEmailResult)

    return res.status(200).json({
      success: true,
      message: 'Meeting scheduled! Confirmation emails sent.',
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
