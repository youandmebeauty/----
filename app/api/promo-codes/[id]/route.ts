import { type NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"
import { verifyAdminToken } from "@/lib/auth-utils"
import { Timestamp } from "firebase-admin/firestore"
import type { PromoCode } from "@/lib/models"

const PROMO_CODES_COLLECTION = "promoCodes"

// GET - Get a specific promo code by ID (admin only)
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await verifyAdminToken(request)
    if (!authResult.valid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const docRef = adminDb.collection(PROMO_CODES_COLLECTION).doc(params.id)
    const doc = await docRef.get()

    if (!doc.exists) {
      return NextResponse.json({ error: "Promo code not found" }, { status: 404 })
    }

    const data = doc.data()!
    const promoCode = {
      id: doc.id,
      ...data,
      expiryDate: data.expiryDate?.toDate ? data.expiryDate.toDate().toISOString() : data.expiryDate,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt,
    } as PromoCode

    return NextResponse.json(promoCode)
  } catch (error) {
    console.error("Error fetching promo code:", error)
    return NextResponse.json({ error: "Failed to fetch promo code" }, { status: 500 })
  }
}

// PUT - Update a promo code (admin only)
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await verifyAdminToken(request)
    if (!authResult.valid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { code, type, value, minPurchase, expiryDate, description, active, usageLimit } = body

    const docRef = adminDb.collection(PROMO_CODES_COLLECTION).doc(params.id)
    const doc = await docRef.get()

    if (!doc.exists) {
      return NextResponse.json({ error: "Promo code not found" }, { status: 404 })
    }

    // If code is being updated, check for duplicates
    if (code) {
      const normalizedCode = code.toUpperCase()
      const existingSnapshot = await adminDb
        .collection(PROMO_CODES_COLLECTION)
        .where("code", "==", normalizedCode)
        .get()

      const existingDoc = existingSnapshot.docs.find((d) => d.id !== params.id)
      if (existingDoc) {
        return NextResponse.json({ error: "Un code promo avec ce code existe déjà" }, { status: 400 })
      }
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: Timestamp.now(),
    }

    if (code !== undefined) updateData.code = code.toUpperCase()
    if (type !== undefined) updateData.type = type
    if (value !== undefined) updateData.value = Number(value)
    if (minPurchase !== undefined) updateData.minPurchase = minPurchase ? Number(minPurchase) : null
    if (expiryDate !== undefined) updateData.expiryDate = expiryDate ? Timestamp.fromDate(new Date(expiryDate)) : null
    if (description !== undefined) updateData.description = description || null
    if (active !== undefined) updateData.active = active
    if (usageLimit !== undefined) updateData.usageLimit = usageLimit ? Number(usageLimit) : null

    await docRef.update(updateData)

    // Fetch updated document
    const updatedDoc = await docRef.get()
    const data = updatedDoc.data()!
    const updatedPromo = {
      id: updatedDoc.id,
      ...data,
      expiryDate: data.expiryDate?.toDate ? data.expiryDate.toDate().toISOString() : data.expiryDate,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt,
    } as PromoCode

    return NextResponse.json(updatedPromo)
  } catch (error) {
    console.error("Error updating promo code:", error)
    return NextResponse.json({ error: "Failed to update promo code" }, { status: 500 })
  }
}

// DELETE - Delete a promo code (admin only)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await verifyAdminToken(request)
    if (!authResult.valid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const docRef = adminDb.collection(PROMO_CODES_COLLECTION).doc(params.id)
    const doc = await docRef.get()

    if (!doc.exists) {
      return NextResponse.json({ error: "Promo code not found" }, { status: 404 })
    }

    await docRef.delete()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting promo code:", error)
    return NextResponse.json({ error: "Failed to delete promo code" }, { status: 500 })
  }
}

