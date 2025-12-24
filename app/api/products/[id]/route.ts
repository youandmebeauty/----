import { type NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"
import { verifyAdminToken } from "@/lib/auth-utils"
import { Timestamp, FieldValue } from "firebase-admin/firestore"
import type { Product } from "@/lib/models"

const PRODUCTS_COLLECTION = "products"

// PUT - Update a product (admin only)
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await verifyAdminToken(request)
    if (!authResult.valid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
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

    const docRef = adminDb.collection(PRODUCTS_COLLECTION).doc(id)
    const doc = await docRef.get()

    if (!doc.exists) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    const currentData = doc.data()!
    const wasHasColorVariants = currentData.hasColorVariants || false
    const nowHasColorVariants = hasColorVariants !== undefined ? hasColorVariants : wasHasColorVariants
    const isSwitchingToColorVariants = nowHasColorVariants && !wasHasColorVariants
    const isSwitchingFromColorVariants = !nowHasColorVariants && wasHasColorVariants

    // Prepare update data
    const updateData: any = {
      updatedAt: Timestamp.now(),
    }

    if (name !== undefined) updateData.name = name
    if (brand !== undefined) updateData.brand = brand
    if (price !== undefined) updateData.price = Number(price)
    if (category !== undefined) updateData.category = category
    if (subcategory !== undefined) {
      updateData.subcategory = subcategory || FieldValue.delete()
    }
    if (description !== undefined) updateData.description = description
    if (longDescription !== undefined) {
      updateData.longDescription = longDescription || FieldValue.delete()
    }
    if (howToUse !== undefined) {
      updateData.howToUse = howToUse || FieldValue.delete()
    }
    
    // Handle images, barcode, and colorVariants based on variant status
    if (isSwitchingToColorVariants) {
      // Switching TO color variants: remove image/images/barcode
      updateData.image = FieldValue.delete()
      updateData.images = FieldValue.delete()
      updateData.barcode = FieldValue.delete()
      updateData.hasColorVariants = true
      // Set color variants if provided
      if (colorVariants !== undefined && Array.isArray(colorVariants)) {
        updateData.colorVariants = colorVariants
      }
    } else if (isSwitchingFromColorVariants) {
      // Switching FROM color variants: remove colorVariants, add images/barcode
      updateData.colorVariants = FieldValue.delete()
      updateData.hasColorVariants = false
      
      // Handle images array
      if (images !== undefined && Array.isArray(images)) {
        updateData.images = images
        updateData.image = images.length > 0 ? images[0] : FieldValue.delete()
      } else {
        // Default to empty if not provided
        updateData.images = []
        updateData.image = FieldValue.delete()
      }
      
      // Handle barcode for non-variant products
      if (barcode !== undefined) {
        updateData.barcode = barcode || FieldValue.delete()
      }
    } else if (nowHasColorVariants) {
      // Already has color variants, update them
      if (colorVariants !== undefined) {
        updateData.colorVariants = Array.isArray(colorVariants) ? colorVariants : []
      }
    } else {
      // No color variants: handle regular images and barcode
      if (images !== undefined && Array.isArray(images)) {
        updateData.images = images
        updateData.image = images.length > 0 ? images[0] : FieldValue.delete()
      } else if (image !== undefined) {
        // Backward compatibility: if only single image provided
        updateData.image = image
        updateData.images = image ? [image] : []
      }
      
      // Handle barcode for non-variant products
      if (barcode !== undefined) {
        updateData.barcode = barcode || FieldValue.delete()
      }
    }
    
    if (quantity !== undefined) updateData.quantity = Number(quantity)
    if (featured !== undefined) updateData.featured = featured
    if (ingredients !== undefined) updateData.ingredients = Array.isArray(ingredients) ? ingredients : []
    if (skinType !== undefined) updateData.skinType = Array.isArray(skinType) ? skinType : []
    if (hairType !== undefined) updateData.hairType = Array.isArray(hairType) ? hairType : []
    
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
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await verifyAdminToken(request)
    if (!authResult.valid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const docRef = adminDb.collection(PRODUCTS_COLLECTION).doc(id)
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

