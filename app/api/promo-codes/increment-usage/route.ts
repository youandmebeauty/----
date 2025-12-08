import { type NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"
import { Timestamp } from "firebase-admin/firestore"

const PROMO_CODES_COLLECTION = "promoCodes"

// POST - Increment promo code usage (called when order is created)
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
      return NextResponse.json({ error: "Promo code not found" }, { status: 404 })
    }

    const doc = snapshot.docs[0]
    const docRef = doc.ref
    const data = doc.data()

    const newUsedCount = (data.usedCount || 0) + 1

    await docRef.update({
      usedCount: newUsedCount,
      updatedAt: Timestamp.now(),
    })

    return NextResponse.json({ success: true, usedCount: newUsedCount })
  } catch (error) {
    console.error("Error incrementing promo code usage:", error)
    return NextResponse.json({ error: "Failed to increment promo code usage" }, { status: 500 })
  }
}

