import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  const { name, email, phone, date, time } = req.body

  // Validate required fields
  if (!name || !email || !phone || !date || !time) {
    return res.status(400).json({ success: false, message: 'Missing required fields' })
  }

  try {
    // Initialize Resend (API key from environment)

    // Format the date and time for display
    const formattedDate = new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    // Email to you (admin)
    const adminEmailResult = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'onboarding@resend.dev',
      to: 'salakodeborah234@gmail.com',
      subject: `New Meeting Request from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ff6b35;">New Meeting Request</h2>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong>Phone:</strong> <a href="tel:${phone}">${phone}</a></p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p><strong>Requested Date:</strong> ${formattedDate}</p>
            <p><strong>Requested Time:</strong> ${time}</p>
          </div>
          <p style="color: #666; font-size: 12px;">This is an automated message from UnkleAyo website.</p>
        </div>
      `
    })

    // Confirmation email to user
    const userEmailResult = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'onboarding@resend.dev',
      to: email,
      subject: 'Meeting Request Received - UnkleAyo',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ff6b35;">Meeting Request Received</h2>
          <p>Hi ${name},</p>
          <p>Thank you for requesting a meeting! We have received your meeting request with the following details:</p>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Requested Date:</strong> ${formattedDate}</p>
            <p><strong>Requested Time:</strong> ${time}</p>
            <p><strong>Your Phone:</strong> ${phone}</p>
          </div>
          <p>We will review your request and contact you shortly to confirm the meeting.</p>
          <p>Best regards,<br><strong>UnkleAyo</strong></p>
          <p style="color: #666; font-size: 12px; margin-top: 30px;">This is an automated message. Please do not reply to this email.</p>
        </div>
      `
    })

    if (adminEmailResult.error || userEmailResult.error) {
      console.error('Email sending error:', adminEmailResult.error || userEmailResult.error)
      return res.status(500).json({
        success: false,
        message: 'Error sending emails'
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Meeting request received. We will contact you soon.'
    })
  } catch (error) {
    console.error('Error processing meeting request:', error)
    return res.status(500).json({
      success: false,
      message: 'Error processing your request. Please try again later.'
    })
  }
}
