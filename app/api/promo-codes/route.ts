import { type NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"
import { verifyAdminToken } from "@/lib/auth-utils"
import { Timestamp } from "firebase-admin/firestore"
import type { PromoCode } from "@/lib/models"

const PROMO_CODES_COLLECTION = "promoCodes"

// GET - Fetch all promo codes (admin only)
export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAdminToken(request)
    if (!authResult.valid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const promosRef = adminDb.collection(PROMO_CODES_COLLECTION)
    const snapshot = await promosRef.orderBy("createdAt", "desc").get()

    const promoCodes = snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        expiryDate: data.expiryDate?.toDate ? data.expiryDate.toDate().toISOString() : data.expiryDate,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt,
      } as PromoCode
    })

    return NextResponse.json(promoCodes)
  } catch (error) {
    console.error("Error fetching promo codes:", error)
    return NextResponse.json({ error: "Failed to fetch promo codes" }, { status: 500 })
  }
}

// POST - Create a new promo code (admin only)
export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAdminToken(request)
    if (!authResult.valid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { code, type, value, minPurchase, expiryDate, description, active, usageLimit } = body

    // Validate required fields
    if (!code || !type || value === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Normalize code to uppercase
    const normalizedCode = code.toUpperCase()

    // Check if code already exists
    const existingSnapshot = await adminDb
      .collection(PROMO_CODES_COLLECTION)
      .where("code", "==", normalizedCode)
      .get()

    if (!existingSnapshot.empty) {
      return NextResponse.json({ error: "Un code promo avec ce code existe déjà" }, { status: 400 })
    }

    // Create promo code
    const promoData = {
      code: normalizedCode,
      type,
      value: Number(value),
      minPurchase: minPurchase ? Number(minPurchase) : null,
      expiryDate: expiryDate ? Timestamp.fromDate(new Date(expiryDate)) : null,
      description: description || null,
      active: active !== undefined ? active : true,
      usageLimit: usageLimit ? Number(usageLimit) : null,
      usedCount: 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    }

    const docRef = await adminDb.collection(PROMO_CODES_COLLECTION).add(promoData)

    const newPromo = {
      id: docRef.id,
      ...promoData,
      expiryDate: promoData.expiryDate?.toDate().toISOString(),
      createdAt: promoData.createdAt.toDate().toISOString(),
      updatedAt: promoData.updatedAt.toDate().toISOString(),
    } as PromoCode

    return NextResponse.json(newPromo, { status: 201 })
  } catch (error) {
    console.error("Error creating promo code:", error)
    return NextResponse.json({ error: "Failed to create promo code" }, { status: 500 })
  }
}

