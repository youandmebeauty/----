import { type NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"
import { generateCustomerEmailBody, generateAdminEmailBody } from "@/lib/services/email-service"
import { adminDb } from "@/lib/utils/firebase-admin-util"

// Gmail SMTP configuration
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

    if (typeof order.id !== "string" || !order.id) {
      return NextResponse.json(
        { success: false, error: "Invalid order data - missing order id" },
        { status: 400 }
      )
    }

    const orderSnapshot = await adminDb.collection("orders").doc(order.id).get()
    const storedOrder = orderSnapshot.data()
    if (!orderSnapshot.exists || storedOrder?.email !== order.email) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 })
    }

    // Validate environment variables
    const gmailUser = process.env.GMAIL_USER?.trim()
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, "")

    if (!gmailUser || !gmailAppPassword) {
      console.error("Missing email configuration:", {
        hasUser: !!gmailUser,
        hasPassword: !!gmailAppPassword
      })
      return NextResponse.json(
        { success: false, error: "Email service not configured" },
        { status: 500 }
      )
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmailUser,
        pass: gmailAppPassword,
      },
    })

    // Send customer email
    const customerMailOptions = {
      from: {
        name: "You & Me Beauty",
        address: gmailUser,
      },
      to: order.email,
      subject: "Confirmation de votre commande",
      html: generateCustomerEmailBody(order),
      replyTo: gmailUser,
    }

    // Send admin email
    const adminMailOptions = {
      from: {
        name: "You & Me Beauty",
        address: gmailUser,
      },
      to: gmailUser,
      subject: `Nouvelle commande #${order.id}`,
      html: generateAdminEmailBody(order),
      replyTo: gmailUser,
    }


    // Send both emails
    const [customerResult, adminResult] = await Promise.allSettled([
      transporter.sendMail(customerMailOptions),
      transporter.sendMail(adminMailOptions),
    ])

    // Check results
    const customerSuccess = customerResult.status === "fulfilled"
    const adminSuccess = adminResult.status === "fulfilled"

    if (!customerSuccess) {
      console.error("Gmail customer email failed:", customerResult.reason)
    }
    if (!adminSuccess) {
      console.error("Gmail admin email failed:", adminResult.reason)
    }

    // Return success if at least customer email was sent
    const errorMessage = !customerSuccess && customerResult.status === "rejected"
      ? customerResult.reason instanceof Error
        ? customerResult.reason.message
        : "Gmail rejected the email"
      : undefined

    return NextResponse.json({
      success: customerSuccess,
      customerEmailSent: customerSuccess,
      adminEmailSent: adminSuccess,
      warning: !adminSuccess ? "Admin notification failed" : undefined,
      error: errorMessage,
    }, { status: customerSuccess ? 200 : 502 })
  } catch (error) {
    console.error("Error in send-order-confirmation:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to send confirmation emails" },
      { status: 500 }
    )
  }
}