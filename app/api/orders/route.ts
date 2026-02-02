import { NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/utils/firebase-admin-util"
import type { Order } from "@/lib/models/models"

const PRODUCTS_COLLECTION = "products"
const COFFRETS_COLLECTION = "coffrets"
const ORDERS_COLLECTION = "orders"

// Helper function to parse item ID and extract product ID and variant index
function parseItemId(itemId: string): { productId: string; variantIndex: number | null } {
  const match = itemId.match(/^(.+)-(\d+)$/)
  if (match) {
    const productId = match[1]
    const variantIndex = parseInt(match[2], 10)
    if (!isNaN(variantIndex) && variantIndex >= 0) {
      return { productId, variantIndex }
    }
  }
  return { productId: itemId, variantIndex: null }
}

// Get stock for a coffret (checks all constituent products)
async function getCoffretStock(coffretId: string): Promise<number> {
  try {
    const coffretDoc = await adminDb.collection(COFFRETS_COLLECTION).doc(coffretId).get()
    
    if (!coffretDoc.exists) {
      console.warn(`Coffret not found: ${coffretId}`)
      return 0
    }

    const coffret = coffretDoc.data() as any
    const coffretQuantity = coffret.quantity ?? 0
    
    // If no products in coffret, return coffret quantity
    if (!coffret.productIds || coffret.productIds.length === 0) {
      return coffretQuantity
    }
    
    // Get stock for all products in the coffret
    const productStocks = await Promise.all(
      coffret.productIds.map(async (productId: string) => {
        const productDoc = await adminDb.collection(PRODUCTS_COLLECTION).doc(productId).get()
        if (!productDoc.exists) {
          console.warn(`Product ${productId} in coffret ${coffretId} not found`)
          return 0
        }
        const product = productDoc.data() as any
        return product.quantity ?? 0
      })
    )
    
    // Return the minimum of coffret quantity and lowest product stock
    const minProductStock = productStocks.length > 0 ? Math.min(...productStocks) : 0
    return Math.min(coffretQuantity, minProductStock)
  } catch (error) {
    console.error(`Error getting coffret stock for ${coffretId}:`, error)
    return 0
  }
}

// Get stock for an item (handles products, variants, AND coffrets)
async function getItemStock(itemId: string): Promise<number> {
  try {
    // First check if it's a coffret
    const coffretDoc = await adminDb.collection(COFFRETS_COLLECTION).doc(itemId).get()
    if (coffretDoc.exists) {
      return await getCoffretStock(itemId)
    }

    // Otherwise handle as product (with possible variant)
    const { productId, variantIndex } = parseItemId(itemId)
    const productDoc = await adminDb.collection(PRODUCTS_COLLECTION).doc(productId).get()
    
    if (!productDoc.exists) {
      console.warn(`Product not found: ${productId}`)
      return 0
    }

    const product = productDoc.data() as any

    if (variantIndex !== null) {
      if (!product.hasColorVariants || !product.colorVariants) {
        console.warn(`Product ${productId} doesn't have color variants`)
        return 0
      }
      
      if (variantIndex < 0 || variantIndex >= product.colorVariants.length) {
        console.warn(`Invalid variantIndex ${variantIndex}`)
        return 0
      }
      
      const variant = product.colorVariants[variantIndex]
      return typeof variant.quantity === 'number' ? variant.quantity : parseInt(String(variant.quantity || 0), 10) || 0
    }

    return product.quantity ?? 0
  } catch (error) {
    console.error(`Error getting stock for itemId ${itemId}:`, error)
    return 0
  }
}



export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json() as Omit<Order, "id" | "createdAt" | "status">

    // Validate stock before creating order
    for (const item of orderData.items) {
      if (!item.id || !item.quantity || item.quantity <= 0) {
        return NextResponse.json(
          { error: `Invalid item: ${item.name || 'Unknown'}` },
          { status: 400 }
        )
      }

      const availableStock = await getItemStock(item.id)
      
      if (availableStock < item.quantity) {
        return NextResponse.json(
          {
            error: `Stock insuffisant pour ${item.name}. Demandé: ${item.quantity}, Disponible: ${availableStock}`
          },
          { status: 400 }
        )
      }
    }

    // Create order after stock validation
    const orderToCreate: any = {
      customerName: orderData.customerName,
      email: orderData.email,
      phone: orderData.phone || null,
      address: orderData.address,
      city: orderData.city,
      postalCode: orderData.postalCode,
      gouvernorat: orderData.gouvernorat,
      items: orderData.items,
      total: orderData.total,
      status: "pending",
      createdAt: new Date().toISOString(),
    }

    // Only include optional fields if they have values
    if (orderData.notes) {
      orderToCreate.notes = orderData.notes
    }
    if (orderData.promoCode) {
      orderToCreate.promoCode = orderData.promoCode
    }
    if (orderData.discount !== undefined && orderData.discount > 0) {
      orderToCreate.discount = orderData.discount
    }

    const docRef = await adminDb.collection(ORDERS_COLLECTION).add(orderToCreate)

    const newOrder: Order = {
      id: docRef.id,
      ...orderToCreate,
    }

    // Increment promo code usage if applicable
    if (orderData.promoCode) {
      try {
        const promoRef = adminDb.collection("promoCodes").where("code", "==", orderData.promoCode).limit(1)
        const promoSnapshot = await promoRef.get()
        
        if (!promoSnapshot.empty) {
          const promoDoc = promoSnapshot.docs[0]
          const currentUsageCount = promoDoc.data().usageCount || 0
          await promoDoc.ref.update({
            usageCount: currentUsageCount + 1
          })
        }
      } catch (promoError) {
        console.error("Error incrementing promo code usage:", promoError)
      }
    }

    return NextResponse.json(newOrder, { status: 201 })
  } catch (error: any) {
    console.error("Error creating order:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create order" },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const ordersSnapshot = await adminDb
      .collection(ORDERS_COLLECTION)
      .orderBy("createdAt", "desc")
      .get()

    const orders: Order[] = ordersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Order))

    return NextResponse.json(orders)
  } catch (error: any) {
    console.error("Error fetching orders:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch orders" },
      { status: 500 }
    )
  }
}