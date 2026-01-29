// Example API route: app/api/products/[id]/stock/route.ts
import { NextRequest, NextResponse } from "next/server"
import { revalidateProducts } from "@/lib/revalidate"
import { adminDb } from "@/lib/firebase-admin"

const PRODUCTS_COLLECTION = "products"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const { quantity } = await request.json()

    if (typeof quantity !== "number" || quantity < 0) {
      return NextResponse.json(
        { error: "Invalid quantity" },
        { status: 400 }
      )
    }

    const productRef = adminDb.collection(PRODUCTS_COLLECTION).doc(id)
    const productDoc = await productRef.get()

    if (!productDoc.exists) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )
    }

    // Update the stock
    await productRef.update({ quantity })

    // Revalidate products cache and record an audit log
    await revalidateProducts("stock-update", { id })

    return NextResponse.json({ success: true, quantity })
  } catch (error) {
    console.error("Error updating product stock:", error)
    return NextResponse.json(
      { error: "Failed to update product stock" },
      { status: 500 }
    )
  }
}