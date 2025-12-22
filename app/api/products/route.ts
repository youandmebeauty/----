import { type NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"
import { verifyAdminToken } from "@/lib/auth-utils"
import { Timestamp } from "firebase-admin/firestore"
import type { Product } from "@/lib/models"
import { Barcode } from "lucide-react"

const PRODUCTS_COLLECTION = "products"

// POST - Create a new product (admin only)
export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAdminToken(request)
    if (!authResult.valid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      barcode,
      brand,
      price,
      category,
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

    // Validate required fields
    // Images are only required if there are no color variants
    if (!name || !price || !category || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    if (!hasColorVariants && !image && (!images || images.length === 0)) {
      return NextResponse.json({ error: "At least one image is required when there are no color variants" }, { status: 400 })
    }

    // Create product
    const productData: any = {
      name: name.trim(),
      brand: brand?.trim() || null,
      barcode: barcode?.trim() || null,
      price: Number(price),
      category,
      subcategory: subcategory?.trim() || null,
      description: description.trim(),
      longDescription: longDescription?.trim() || null,
      howToUse: howToUse?.trim() || null,
      quantity: Number(quantity) || 0,
      featured: featured || false,
      ingredients: Array.isArray(ingredients) ? ingredients : [],
      skinType: Array.isArray(skinType) ? skinType : [],
      hairType: Array.isArray(hairType) ? hairType : [],
      hasColorVariants: hasColorVariants || false,
      colorVariants: (hasColorVariants && Array.isArray(colorVariants)) ? colorVariants : [],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    }

    // Only include images if there are no color variants
    if (!hasColorVariants) {
      if (Array.isArray(images) && images.length > 0) {
        productData.images = images
        productData.image = images[0] // First image as main for backward compatibility
      } else if (image) {
        productData.image = image.trim()
        productData.images = [image.trim()] // Convert single image to array
      }
    }

    const docRef = await adminDb.collection(PRODUCTS_COLLECTION).add(productData)

    const newProduct = {
      id: docRef.id,
      ...productData,
      createdAt: productData.createdAt.toDate().toISOString(),
      updatedAt: productData.updatedAt.toDate().toISOString(),
    } as Product

    return NextResponse.json(newProduct, { status: 201 })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}




