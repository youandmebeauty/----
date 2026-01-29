import "server-only"
import { type NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"
import { verifyAdminToken } from "@/lib/auth-utils"
import { Timestamp } from "firebase-admin/firestore"
import type { Product } from "@/lib/models"
import { getProductsCached } from "@/lib/products.server"
import { revalidateProducts } from "@/lib/revalidate"

const PRODUCTS_COLLECTION = "products"

// caching is handled by lib/product-cache

function sanitizePerfumeNotes(notes: any) {
  if (!notes) return null

  const top = Array.isArray(notes.top)
    ? notes.top.map((n: unknown) => (typeof n === "string" ? n.trim() : "")).filter(Boolean)
    : []
  const heart = Array.isArray(notes.heart)
    ? notes.heart.map((n: unknown) => (typeof n === "string" ? n.trim() : "")).filter(Boolean)
    : []
  const base = Array.isArray(notes.base)
    ? notes.base.map((n: unknown) => (typeof n === "string" ? n.trim() : "")).filter(Boolean)
    : []

  if (top.length === 0 && heart.length === 0 && base.length === 0) return null

  return {
    ...(top.length ? { top } : {}),
    ...(heart.length ? { heart } : {}),
    ...(base.length ? { base } : {}),
  }
}

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
      perfumeNotes,
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

    const cleanedPerfumeNotes = sanitizePerfumeNotes(perfumeNotes)
    if (cleanedPerfumeNotes) {
      productData.perfumeNotes = cleanedPerfumeNotes
    }

    // Only include images and barcode if there are no color variants
    if (!hasColorVariants) {
      if (Array.isArray(images) && images.length > 0) {
        productData.images = images
        productData.image = images[0] // First image as main for backward compatibility
      } else if (image) {
        productData.image = image.trim()
        productData.images = [image.trim()] // Convert single image to array
      }
      // Only add barcode for non-variant products
      productData.barcode = barcode?.trim() || null
    }

    const docRef = await adminDb.collection(PRODUCTS_COLLECTION).add(productData)

    const newProduct = {
      id: docRef.id,
      ...productData,
      createdAt: productData.createdAt.toDate().toISOString(),
      updatedAt: productData.updatedAt.toDate().toISOString(),
    } as Product

    // Revalidate products cache and record an audit log
    await revalidateProducts("create", { id: docRef.id, name: productData.name })

    return NextResponse.json(newProduct, { status: 201 })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}

// GET - fetch all products (admin only). Supports `?force=true` to bypass cache.
export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAdminToken(request)
    if (!authResult.valid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Use server-only cached fetch
    const products = await getProductsCached()

    return NextResponse.json(products)
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}