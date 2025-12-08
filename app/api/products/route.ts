import { type NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"
import { verifyAdminToken } from "@/lib/auth-utils"
import { Timestamp } from "firebase-admin/firestore"
import type { Product } from "@/lib/models"

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
      brand,
      price,
      category,
      subcategory,
      description,
      longDescription,
      image,
      quantity,
      featured,
      ingredients,
      skinType,
      hairType,
      hasColorVariants,
      colorVariants,
    } = body

    // Validate required fields
    // Image is only required if there are no color variants
    if (!name || !price || !category || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    if (!hasColorVariants && !image) {
      return NextResponse.json({ error: "Image is required when there are no color variants" }, { status: 400 })
    }

    // Create product
    const productData: any = {
      name: name.trim(),
      brand: brand?.trim() || null,
      price: Number(price),
      category,
      subcategory: subcategory?.trim() || null,
      description: description.trim(),
      longDescription: longDescription?.trim() || null,
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

    // Only include image if there are no color variants
    if (!hasColorVariants && image) {
      productData.image = image.trim()
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




