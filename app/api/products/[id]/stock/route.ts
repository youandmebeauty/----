// Example API route: app/api/products/[id]/stock/route.ts
import { NextRequest, NextResponse } from "next/server"
import { revalidateProducts } from "@/lib/utils/revalidate-util"
import { adminDb } from "@/lib/utils/firebase-admin-util"
import { revalidateTag } from "next/cache"
import { Timestamp } from "firebase-admin/firestore"

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

    // If product is part of any coffret, recompute & persist coffret quantity and revalidate coffrets cache
    try {
      const coffretSnap = await adminDb.collection("coffrets").where("productIds", "array-contains", id).get()
      if (!coffretSnap.empty) {
        const coffretDocs = coffretSnap.docs
        for (const coffDoc of coffretDocs) {
          const data = coffDoc.data()
          const productIds: string[] = Array.isArray(data.productIds) ? data.productIds : []
          if (productIds.length === 0) continue

          // fetch each product's quantity from Firestore
          const proms = productIds.map(pid => adminDb.collection("products").doc(pid).get())
          const prodSnaps = await Promise.all(proms)
          const stocks = prodSnaps.map(s => {
            const pd = s.data()
            return pd?.quantity ?? 0
          })
          const newQuantity = stocks.length > 0 ? Math.min(...stocks) : 0

          // only update if changed
          if (data.quantity !== newQuantity) {
            await adminDb.collection("coffrets").doc(coffDoc.id).update({ quantity: newQuantity, updatedAt: Timestamp.now() })
            console.info(`[coffret update] updated coffret ${coffDoc.id} quantity -> ${newQuantity}`)
          }
        }

        // revalidate coffrets once
        await revalidateTag("coffrets", "default")
        console.info(`[coffrets revalidate] product ${id} affected coffrets, revalidated coffrets tag`)
      }
    } catch (err) {
      console.warn("Failed to recompute/update coffrets after product stock change:", err)
    }

    return NextResponse.json({ success: true, quantity })
  } catch (error) {
    console.error("Error updating product stock:", error)
    return NextResponse.json(
      { error: "Failed to update product stock" },
      { status: 500 }
    )
  }
}