// Example API route: app/api/products/[id]/variants/[variantIndex]/stock/route.ts
import { NextRequest, NextResponse } from "next/server"
import { revalidateTag } from "next/cache"
import { adminDb } from "@/lib/firebase-admin"
import type { Product } from "@/lib/models"

const PRODUCTS_COLLECTION = "products"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; variantIndex: string } }
) {
  try {
    const { id, variantIndex } = params
    const { quantity } = await request.json()

    const variantIdx = parseInt(variantIndex, 10)

    if (isNaN(variantIdx) || variantIdx < 0) {
      return NextResponse.json(
        { error: "Invalid variant index" },
        { status: 400 }
      )
    }

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

    const productData = productDoc.data() as Product

    if (!productData.hasColorVariants || !productData.colorVariants || !productData.colorVariants[variantIdx]) {
      return NextResponse.json(
        { error: "Variant not found" },
        { status: 404 }
      )
    }

    // Update the variant quantity
    const updatedVariants = [...productData.colorVariants]
    updatedVariants[variantIdx] = {
      ...updatedVariants[variantIdx],
      quantity,
    }

    // Calculate total quantity across all variants
    const totalQuantity = updatedVariants.reduce((sum, v) => sum + v.quantity, 0)

    // Update both the variant and the total product quantity
    await productRef.update({
      colorVariants: updatedVariants,
      quantity: totalQuantity,
    })

    // ✅ STEP 5: Invalidate cache after mutation
    await revalidateTag("products", "default")

    return NextResponse.json({ 
      success: true, 
      variantQuantity: quantity,
      totalQuantity 
    })
  } catch (error) {
    console.error("Error updating variant stock:", error)
    return NextResponse.json(
      { error: "Failed to update variant stock" },
      { status: 500 }
    )
  }
}