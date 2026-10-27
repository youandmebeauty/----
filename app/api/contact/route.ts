// app/api/contact/route.ts
import { type NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"
import { z } from "zod"
import { adminDb } from "@/lib/utils/firebase-admin-util"
import { Timestamp } from "firebase-admin/firestore"
import { createHash } from "node:crypto"

// Schema de validation Zod
const contactSchema = z.object({
  name: z.string().trim().min(2, "Le nom doit contenir au moins 2 caractères").max(100),
  email: z.string().trim().email("Format d'email invalide").max(320),
  subject: z.string().trim().min(5, "Le sujet doit contenir au moins 5 caractères").max(200),
  message: z.string().trim().min(10, "Le message doit contenir au moins 10 caractères").max(5000),
})

// Configuration SMTP Gmail
const createTransporter = () => {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn("⚠️ Les identifiants Gmail ne sont pas configurés.")
    return null
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  })
}

const RATE_LIMIT_DURATION = 15 * 60 * 1000 // 15 minutes

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 1. Validation Zod
    const result = contactSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error.issues[0]?.message ?? "Données invalides.",
        },
        { status: 400 }
      )
    }


    const { name, email, subject, message } = result.data

    // 2. Rate Limiting (IP-based) - 15 minute window
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      request.headers.get("x-real-ip") ||
      "unknown"

    if (ip !== "unknown") {
      const rateLimitRef = adminDb.collection("rate_limits")
      const ipKey = createHash("sha256").update(ip).digest("hex")
      const docRef = rateLimitRef.doc(`contact_${ipKey}`)

      const doc = await docRef.get()

      if (doc.exists) {
        const data = doc.data()
        const lastTimestamp = data?.timestamp as Timestamp

        if (lastTimestamp) {
          const now = Date.now()
          const timeSinceLastRequest = now - lastTimestamp.toMillis()

          // Check if within 15-minute window
          if (timeSinceLastRequest < RATE_LIMIT_DURATION) {
            const minutesRemaining = Math.ceil((RATE_LIMIT_DURATION - timeSinceLastRequest) / 60000)
            return NextResponse.json(
              {
                success: false,
                error: `Trop de demandes. Veuillez réessayer dans ${minutesRemaining} minute${minutesRemaining > 1 ? 's' : ''}.`
              },
              { status: 429 }
            )
          }
        }
      }

      // Store/update rate limit document with IP and timestamp
      await docRef.set({
        ip,
        timestamp: Timestamp.now(),
        type: "contact"
      })
    }

    const transporter = createTransporter()

    if (!transporter) {
      return NextResponse.json({
        success: true,
        message: "Votre message a été reçu (Mode Dev).",
      })
    }

    // Générer le contenu des emails
    const adminEmailHtml = generateAdminEmailBody({ name, email, subject, message })
    const customerEmailHtml = generateCustomerEmailBody({ name, subject })

    // Envoyer l'email à l'administrateur
    await transporter.sendMail({
      from: {
        name: "Formulaire de Contact You&me Beauty",
        address: process.env.GMAIL_USER!,
      },
      to: process.env.GMAIL_USER,
      subject: `Formulaire de Contact: ${subject}`,
      html: adminEmailHtml,
      replyTo: email,
    })

    // Envoyer l'email de confirmation au client
    await transporter.sendMail({
      from: {
        name: "You&me Beauty",
        address: process.env.GMAIL_USER!,
      },
      to: email,
      subject: "Merci de nous avoir contacté - You&me Beauty",
      html: customerEmailHtml,
    })

    return NextResponse.json({
      success: true,
      message: "Votre message a été envoyé avec succès!",
    })
  } catch (error) {
    console.error("Erreur contact API:", error)
    return NextResponse.json(
      { success: false, error: "Une erreur est survenue." },
      { status: 500 }
    )
  }
}

function generateAdminEmailBody({ name, email, subject, message }: any): string {
  const safeName = escapeHtml(name)
  const safeEmail = escapeHtml(email)
  const safeSubject = escapeHtml(subject)
  const safeMessage = escapeHtml(message)
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #45062E; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">You&me Beauty - Formulaire de Contact</h1>
      </div>
      
      <div style="padding: 20px; background-color: #f9f9f9;">
        <h2 style="color: #45062E; margin-bottom: 20px;">Nouveau Message de Contact</h2>
        
        <div style="background-color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #45062E; margin-top: 0;">Détails du Contact</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #666;">Nom:</td>
              <td style="padding: 8px 0;">${safeName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #666;">Email:</td>
              <td style="padding: 8px 0;"><a href="mailto:${safeEmail}" style="color: #45062E;">${safeEmail}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #666;">Sujet:</td>
              <td style="padding: 8px 0;">${safeSubject}</td>
            </tr>
          </table>
        </div>
        
        <div style="background-color: white; padding: 20px; border-radius: 8px;">
          <h3 style="color: #45062E; margin-top: 0;">Message</h3>
          <div style="background-color: #f8f8f8; padding: 15px; border-radius: 4px; border-left: 4px solid #45062E;">
            <p style="margin: 0; line-height: 1.6; white-space: pre-wrap;">${safeMessage}</p>
          </div>
        </div>
      </div>
    </div>
  `
}

function generateCustomerEmailBody({ name, subject }: any): string {
  const safeName = escapeHtml(name)
  const safeSubject = escapeHtml(subject)
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #45062E; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">You & Me Beauty</h1>
      </div>
      
      <div style="padding: 30px; background-color: #f9f9f9;">
        <h2 style="color: #45062E; margin-bottom: 20px;">Merci de nous avoir contacté!</h2>
        
        <div style="background-color: white; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
          <p style="margin: 0 0 15px 0; font-size: 16px;">Cher(e) ${safeName},</p>
          
          <p style="margin: 0 0 15px 0; line-height: 1.6;">
            Merci d'avoir contacté You & Me Beauty! Nous avons bien reçu votre message concernant 
            "<strong>${safeSubject}</strong>".
          </p>
        </div>
      </div>
    </div>
  `
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[character] ?? character))
}