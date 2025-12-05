import { type NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"

// Gmail SMTP configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

export async function POST(request: NextRequest) {
  try {
    const { to, subject, html, type } = await request.json()

    // Validate required fields
    if (!to || !subject || !html) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Email options
    const mailOptions = {
      from: {
        name: "you&me Beauty",
        address: process.env.GMAIL_USER!,
      },
      to: to,
      subject: subject,
      html: html,
      replyTo: process.env.GMAIL_USER,
    }

    // Send email
    await transporter.sendMail(mailOptions)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error sending email:", error)
    return NextResponse.json({ success: false, error: "Failed to send email" }, { status: 500 })
  }
}
