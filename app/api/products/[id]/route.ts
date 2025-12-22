import { type NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"
import { verifyAdminToken } from "@/lib/auth-utils"
import { Timestamp } from "firebase-admin/firestore"
import type { Product } from "@/lib/models"

const PRODUCTS_COLLECTION = "products"

// PUT - Update a product (admin only)
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await verifyAdminToken(request)
    if (!authResult.valid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      brand,
      price,
      category,
      barcode,
      subcategory,
      description,
      longDescription,
      howToUse,
      image,
      images,
      quantity,
      featured,
      ingredients,
      skinType,
      hairType,
      hasColorVariants,
      colorVariants,
    } = body

    const docRef = adminDb.collection(PRODUCTS_COLLECTION).doc(params.id)
    const doc = await docRef.get()

    if (!doc.exists) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    const currentData = doc.data()!
    const wasHasColorVariants = currentData.hasColorVariants || false
    const isSwitchingToColorVariants = hasColorVariants !== undefined && hasColorVariants && !wasHasColorVariants

    // Prepare update data
    const updateData: any = {
      updatedAt: Timestamp.now(),
    }

    if (name !== undefined) updateData.name = name
    if (brand !== undefined) updateData.brand = brand
    if (price !== undefined) updateData.price = Number(price)
    if (category !== undefined) updateData.category = category
    if (subcategory !== undefined) updateData.subcategory = subcategory || null
    if (description !== undefined) updateData.description = description
    if (longDescription !== undefined) updateData.longDescription = longDescription || null
    // Only update image/images if there are no color variants
    // If switching to color variants, remove the image and images
    if (isSwitchingToColorVariants) {
      updateData.image = null
      updateData.images = null
    } else if (!hasColorVariants) {
      // Handle images array
      if (images !== undefined && Array.isArray(images)) {
        updateData.images = images
        updateData.image = images.length > 0 ? images[0] : null // First image as main
      } else if (image !== undefined) {
        // Backward compatibility: if only single image provided
        updateData.image = image
        updateData.images = image ? [image] : []
      }
    }
    if (quantity !== undefined) updateData.quantity = Number(quantity)
    if (featured !== undefined) updateData.featured = featured
    if (ingredients !== undefined) updateData.ingredients = Array.isArray(ingredients) ? ingredients : []
    if (skinType !== undefined) updateData.skinType = Array.isArray(skinType) ? skinType : []
    if (hairType !== undefined) updateData.hairType = Array.isArray(hairType) ? hairType : []
    if (hasColorVariants !== undefined) updateData.hasColorVariants = hasColorVariants
    if (colorVariants !== undefined) updateData.colorVariants = Array.isArray(colorVariants) ? colorVariants : []
    if (howToUse !== undefined) updateData.howToUse = howToUse || null
    if (barcode !== undefined) updateData.barcode = barcode || null
    await docRef.update(updateData)

    // Fetch updated document
    const updatedDoc = await docRef.get()
    const data = updatedDoc.data()!
    const updatedProduct = {
      id: updatedDoc.id,
      ...data,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt,
    } as Product

    return NextResponse.json(updatedProduct)
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}

// DELETE - Delete a product (admin only)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await verifyAdminToken(request)
    if (!authResult.valid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const docRef = adminDb.collection(PRODUCTS_COLLECTION).doc(params.id)
    const doc = await docRef.get()

    if (!doc.exists) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    await docRef.delete()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}

