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

    console.log('✅ Validation passed, processing payment confirmation...')

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

    const adminEmail_ = adminEmail || process.env.ADMIN_EMAIL || 'salakodeborah234@gmail.com'

    console.log('📧 Sending emails via Formspree...')
    console.log('User email to:', email)
    console.log('Admin email to:', adminEmail_)

    // Send confirmation email to user via Formspree
    const userEmailData = {
      email: email,
      message: `Meeting Confirmation\n\nDear ${name},\n\nYour meeting has been scheduled successfully!\n\nDetails:\nDate: ${formattedDate}\nTime: ${time}\nReference: ${paymentIntentId.slice(-8).toUpperCase()}\n\nThank you for booking with UnkleAyo.`,
      subject: `✅ Meeting Confirmed - ${formattedDate} at ${time}`,
      _subject: `✅ Meeting Confirmed - ${formattedDate} at ${time}`,
      _template: 'table'
    }

    try {
      const userResponse = await fetch('https://formspree.io/f/myzwkepe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userEmailData)
      })
      
      console.log('✅ User confirmation email submitted to Formspree:', userResponse.status)
    } catch (userEmailErr) {
      console.error('⚠️ Error sending user email:', userEmailErr.message)
    }

    // Send admin notification via Formspree
    const adminEmailData = {
      email: adminEmail_,
      message: `New Meeting Booking\n\nCustomer: ${name}\nEmail: ${email}\nPhone: ${phone}\nDate: ${formattedDate}\nTime: ${time}\nAmount: ${amount} ${currency}\nReference: ${paymentIntentId}\n\nThis is an automated notification from UnkleAyo.`,
      subject: `📅 New Meeting Scheduled - ${name}`,
      _subject: `📅 New Meeting Scheduled - ${name}`,
      _template: 'table'
    }

    try {
      const adminResponse = await fetch('https://formspree.io/f/myzwkepe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(adminEmailData)
      })
      
      console.log('✅ Admin notification email submitted to Formspree:', adminResponse.status)
    } catch (adminEmailErr) {
      console.error('⚠️ Error sending admin email:', adminEmailErr.message)
    }

    return res.status(200).json({
      success: true,
      message: 'Meeting scheduled successfully! Confirmation emails have been sent.',
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
