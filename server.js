import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'Backend server is running'
  })
})

// CORS test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'CORS is working correctly',
    timestamp: new Date().toISOString()
  })
})

// Schedule meeting endpoint
app.post('/api/schedule-meeting', async (req, res) => {
  console.log('Meeting request received:', req.body)

  const { name, email, phone, date, time, currency, amount } = req.body

  if (!name || !email || !phone || !date || !time || !currency || !amount) {
    return res.status(400).json({ success: false, message: 'Missing required fields' })
  }

  // Validate time is within 6pm-9pm (18:00-21:00)
  const [hours] = time.split(':')
  const hour = parseInt(hours)
  if (hour < 18 || hour >= 21) {
    return res.status(400).json({
      success: false,
      message: 'Meeting times are only available from 6:00 PM to 8:59 PM'
    })
  }

  try {
    const formattedDate = new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    console.log('Meeting scheduled:', { name, email, phone, date: formattedDate, time })

    // Try to send emails if Resend is configured
    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import('resend')
        const resend = new Resend(process.env.RESEND_API_KEY)

        // Email to admin
        const adminEmailResult = await resend.emails.send({
          from: 'onboarding@resend.dev',
          to: 'salakodeborah234@gmail.com',
          subject: `📅 New Meeting Scheduled - ${name} on ${formattedDate}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px; border-radius: 8px;">
              <h2 style="color: #ff6b35; margin-top: 0;">📅 New Meeting Scheduled</h2>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff6b35;">
                <h3 style="margin-top: 0; color: #333;">Customer Information</h3>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
                <p><strong>Phone:</strong> <a href="tel:${phone}">${phone}</a></p>
              </div>

              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff6b35;">
                <h3 style="margin-top: 0; color: #333;">Meeting Details</h3>
                <p><strong>📅 Date:</strong> ${formattedDate}</p>
                <p><strong>⏰ Time:</strong> ${time}</p>
                <p><strong>💰 Amount Paid:</strong> ${amount} ${currency}</p>
                <p><strong>✅ Payment Status:</strong> Confirmed</p>
              </div>

              <p style="color: #666; font-size: 12px; margin-top: 30px;">This is an automated message from UnkleAyo website.</p>
            </div>
          `
        })
        console.log('Admin email sent:', adminEmailResult)

        // Email to user
        const userEmailResult = await resend.emails.send({
          from: 'onboarding@resend.dev',
          to: email,
          subject: `✅ Meeting Confirmed - ${formattedDate} at ${time}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #ff6b35;">✅ Your Meeting is Confirmed!</h2>
              <p>Hi ${name},</p>
              <p>Your meeting has been successfully scheduled.</p>
              
              <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>📅 Date:</strong> ${formattedDate}</p>
                <p><strong>⏰ Time:</strong> ${time}</p>
                <p><strong>💰 Amount Paid:</strong> ${amount} ${currency}</p>
              </div>

              <p>You will receive a meeting link via email before the scheduled time.</p>
              <p>Best regards,<br>UnkleAyo Team</p>
            </div>
          `
        })
        console.log('User email sent:', userEmailResult)

        console.log('✅ Confirmation emails sent successfully')
      } catch (emailError) {
        console.error('❌ Email sending failed:', emailError.message)
        console.error('Full error:', emailError)
      }
    } else {
      console.warn('⚠️  RESEND_API_KEY not configured - emails will not be sent')
    }

    return res.status(200).json({
      success: true,
      message: 'Meeting scheduled successfully! Check your email for confirmation.'
    })
  } catch (error) {
    console.error('Error scheduling meeting:', error)
    return res.status(500).json({
      success: false,
      message: 'Error scheduling meeting. Please try again later.'
    })
  }
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on http://localhost:${PORT}`)
  console.log(`Access from other devices using your computer's IP address on port ${PORT}`)
  console.log(`\n📌 To enable remote access from ANY device (not on same WiFi):`)
  console.log(`1. Install ngrok: https://ngrok.com/download`)
  console.log(`2. Run in another terminal: ngrok http 3001`)
  console.log(`3. Copy the forwarding URL and set it in VITE_PUBLIC_URL environment variable`)
})
