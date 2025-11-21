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

  console.log('Meeting request received:', { name, email, phone, date, time })

  try {
    // Check if API key is set
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY environment variable is not set')
      return res.status(500).json({
        success: false,
        message: 'Email service is not configured. Please try again later.'
      })
    }

    // Format the date and time for display
    const formattedDate = new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    // Email to you (admin)
    const adminEmailResult = await resend.emails.send({
      from: 'onboarding@resend.dev',
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

    // Confirmation email to you (since we can only send to verified email on free tier)
    const userEmailResult = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'salakodeborah234@gmail.com',
      subject: `Confirmation: Meeting Request from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ff6b35;">Meeting Request Summary</h2>
          <p>You have received a new meeting request:</p>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Requestor Name:</strong> ${name}</p>
            <p><strong>Requestor Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong>Requestor Phone:</strong> <a href="tel:${phone}">${phone}</a></p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p><strong>Requested Date:</strong> ${formattedDate}</p>
            <p><strong>Requested Time:</strong> ${time}</p>
          </div>
          <p><strong>Next Step:</strong> Contact the requestor at ${email} or ${phone} to confirm the meeting.</p>
          <p style="color: #666; font-size: 12px; margin-top: 30px;">This is an automated message from UnkleAyo website.</p>
        </div>
      `
    })

    if (adminEmailResult.error || userEmailResult.error) {
      const adminError = adminEmailResult.error
      const userError = userEmailResult.error
      
      console.error('Admin email error:', adminError)
      console.error('User email error:', userError)
      
      return res.status(500).json({
        success: false,
        message: 'Error sending emails. Please try again in a moment.',
        error: {
          admin: adminError?.message || null,
          user: userError?.message || null
        }
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
