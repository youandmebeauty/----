import { type NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"

const PROMO_CODES_COLLECTION = "promoCodes"

// POST - Validate a promo code (public endpoint for cart)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code } = body

    if (!code) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 })
    }

    const normalizedCode = code.toUpperCase()
    const snapshot = await adminDb
      .collection(PROMO_CODES_COLLECTION)
      .where("code", "==", normalizedCode)
      .limit(1)
      .get()

    if (snapshot.empty) {
      return NextResponse.json({ error: "Code promo invalide" }, { status: 404 })
    }

    const doc = snapshot.docs[0]
    const data = doc.data()

    // Check if promo is active
    if (data.active === false) {
      return NextResponse.json({ error: "Ce code promo n'est plus actif" }, { status: 400 })
    }

    // Check expiry date
    if (data.expiryDate) {
      const expiryDate = data.expiryDate.toDate()
      if (new Date() > expiryDate) {
        return NextResponse.json({ error: "Ce code promo a expiré" }, { status: 400 })
      }
    }

    // Check usage limit
    if (data.usageLimit && data.usedCount >= data.usageLimit) {
      return NextResponse.json({ error: "Ce code promo a atteint sa limite d'utilisation" }, { status: 400 })
    }

    // Return promo code data (without sensitive info)
    const promoCode = {
      id: doc.id,
      code: data.code,
      type: data.type,
      value: data.value,
      minPurchase: data.minPurchase || null,
      expiryDate: data.expiryDate?.toDate ? data.expiryDate.toDate().toISOString() : null,
      description: data.description || null,
      active: data.active !== undefined ? data.active : true,
      usageLimit: data.usageLimit || null,
      usedCount: data.usedCount || 0,
    }

    return NextResponse.json(promoCode)
  } catch (error) {
    console.error("Error validating promo code:", error)
    return NextResponse.json({ error: "Failed to validate promo code" }, { status: 500 })
  }
}

