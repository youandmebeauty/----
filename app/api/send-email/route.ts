import { type NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"
import { generateCustomerEmailBody, generateAdminEmailBody } from "@/lib/services/email-service"

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
    const body = await request.json()

    const { order } = body

    // Validate order
    if (!order) {
      console.error("No order in request body")
      return NextResponse.json(
        { success: false, error: "Order data is missing" },
        { status: 400 }
      )
    }

    if (!order.email || !order.customerName) {
      console.error("Invalid order data:", { email: order.email, customerName: order.customerName })
      return NextResponse.json(
        { success: false, error: "Invalid order data - missing email or customer name" },
        { status: 400 }
      )
    }

    // Validate environment variables
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      console.error("Missing email configuration:", {
        hasUser: !!process.env.GMAIL_USER,
        hasPassword: !!process.env.GMAIL_APP_PASSWORD
      })
      return NextResponse.json(
        { success: false, error: "Email service not configured" },
        { status: 500 }
      )
    }

    // Send customer email
    const customerMailOptions = {
      from: {
        name: "You & Me Beauty",
        address: process.env.GMAIL_USER,
      },
      to: order.email,
      subject: "Confirmation de votre commande",
      html: generateCustomerEmailBody(order),
      replyTo: process.env.GMAIL_USER,
    }

    // Send admin email
    const adminMailOptions = {
      from: {
        name: "You & Me Beauty",
        address: process.env.GMAIL_USER,
      },
      to: process.env.GMAIL_USER,
      subject: `Nouvelle commande #${order.id}`,
      html: generateAdminEmailBody(order),
      replyTo: process.env.GMAIL_USER,
    }


    // Send both emails
    const [customerResult, adminResult] = await Promise.allSettled([
      transporter.sendMail(customerMailOptions),
      transporter.sendMail(adminMailOptions),
    ])

    // Check results
    const customerSuccess = customerResult.status === "fulfilled"
    const adminSuccess = adminResult.status === "fulfilled"

    // Return success if at least customer email was sent
    return NextResponse.json({
      success: customerSuccess,
      customerEmailSent: customerSuccess,
      adminEmailSent: adminSuccess,
      warning: !adminSuccess ? "Admin notification failed" : undefined,
    })
  } catch (error) {
    console.error("Error in send-order-confirmation:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to send confirmation emails" },
      { status: 500 }
    )
  }
}