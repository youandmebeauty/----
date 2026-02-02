import { NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/utils/firebase-admin-util"
import { revalidateProducts } from "@/lib/utils/revalidate-util"
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



export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const orderDoc = await adminDb.collection(ORDERS_COLLECTION).doc(id).get()

    if (!orderDoc.exists) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      )
    }

    const order: Order = {
      id: orderDoc.id,
      ...orderDoc.data()
    } as Order

    return NextResponse.json(order)
  } catch (error: any) {
    console.error("Error fetching order:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch order" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { status } = await request.json()

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      )
    }

    const orderRef = adminDb.collection(ORDERS_COLLECTION).doc(id)
    const orderDoc = await orderRef.get()

    if (!orderDoc.exists) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      )
    }

    const orderData = orderDoc.data() as Order
    const previousStatus = orderData.status

    // If status is unchanged, just return current order
    if (status === previousStatus) {
      const currentOrder: Order = {
        ...orderData,
        id,
      }
      return NextResponse.json(currentOrder)
    }


    // Update order status after any necessary stock changes
    await orderRef.update({ status })

    // Revalidate products cache because stock changes occurred
    try {
      await revalidateProducts("order-status-change", { id, status, previousStatus })
    } catch (e) {
      console.warn("Failed to revalidate products after order status change:", e)
    }


    const updatedOrder: Order = {
      ...orderData,
      id,
      status
    }

    return NextResponse.json(updatedOrder)
  } catch (error: any) {
    console.error("Error updating order status:", error)
    return NextResponse.json(
      { error: error.message || "Failed to update order status" },
      { status: 500 }
    )
  }
}