export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  const { name, email, phone, date, time, message } = req.body

  // Validate required fields
  if (!name || !email || !phone || !date || !time) {
    return res.status(400).json({ success: false, message: 'Missing required fields' })
  }

  try {
    // TODO: Configure your email service here
    // This is where you'd integrate with services like:
    // - SendGrid
    // - Mailgun
    // - AWS SES
    // - Nodemailer
    // - etc.

    // For now, we'll just log the meeting request
    console.log('Meeting request:', { name, email, phone, date, time })

    // Example: Send email using SendGrid (you need to set SENDGRID_API_KEY env variable)
    // import sgMail from '@sendgrid/mail'
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY)
    // await sgMail.send({
    //   to: 'your-email@example.com',
    //   from: 'noreply@unkleayo.com',
    //   subject: `New Meeting Request from ${name}`,
    //   html: `
    //     <h2>New Meeting Request</h2>
    //     <p><strong>Name:</strong> ${name}</p>
    //     <p><strong>Email:</strong> ${email}</p>
    //     <p><strong>Phone:</strong> ${phone}</p>
    //     <p><strong>Requested Date:</strong> ${date}</p>
    //     <p><strong>Requested Time:</strong> ${time}</p>
    //   `
    // })

    return res.status(200).json({ 
      success: true, 
      message: 'Meeting request received. We will contact you soon.' 
    })
  } catch (error) {
    console.error('Error processing meeting request:', error)
    return res.status(500).json({ 
      success: false, 
      message: 'Error processing your request' 
    })
  }
}
