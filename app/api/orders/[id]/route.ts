import { NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"
import type { Order } from "@/lib/models"

const PRODUCTS_COLLECTION = "products"
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

// Get stock for an item (handles variants)
async function getItemStock(itemId: string): Promise<number> {
  try {
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

// Update stock for an item (handles variants)
async function updateItemStock(itemId: string, quantity: number): Promise<void> {
  const { productId, variantIndex } = parseItemId(itemId)
  const productRef = adminDb.collection(PRODUCTS_COLLECTION).doc(productId)
  
  if (variantIndex !== null) {
    // Update variant stock
    const productDoc = await productRef.get()
    if (!productDoc.exists) {
      throw new Error("Product not found")
    }

    const productData = productDoc.data() as any
    if (!productData.hasColorVariants || !productData.colorVariants || !productData.colorVariants[variantIndex]) {
      throw new Error(`Variant ${variantIndex} not found`)
    }

    const updatedVariants = [...productData.colorVariants]
    updatedVariants[variantIndex] = {
      ...updatedVariants[variantIndex],
      quantity
    }

    const totalQuantity = updatedVariants.reduce((sum: number, v: any) => sum + v.quantity, 0)

    await productRef.update({
      colorVariants: updatedVariants,
      quantity: totalQuantity
    })
  } else {
    // Update product stock
    await productRef.update({ quantity })
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

    // When marking an order as shipped or delivered for the first time, reduce stock for each item
    if ((status === "shipped" || status === "delivered") && previousStatus !== "shipped" && previousStatus !== "delivered") {
      if (!orderData.items || !Array.isArray(orderData.items)) {
        return NextResponse.json(
          { error: "Order items are invalid, cannot update stock" },
          { status: 500 }
        )
      }

      const stockChanges: { itemId: string; newStock: number }[] = []

      // First validate stock for all items
      for (const item of orderData.items) {
        if (!item.id || !item.quantity || item.quantity <= 0) {
          console.warn(`Invalid item in order ${id}:`, item)
          return NextResponse.json(
            { error: "One or more order items are invalid" },
            { status: 400 }
          )
        }

        const currentStock = await getItemStock(item.id)
        if (currentStock < item.quantity) {
          return NextResponse.json(
            {
              error: `Stock insuffisant pour ${item.name}. Demandé: ${item.quantity}, Disponible: ${currentStock}`
            },
            { status: 400 }
          )
        }

        stockChanges.push({ itemId: item.id, newStock: currentStock - item.quantity })
      }

      // Apply stock updates
      for (const change of stockChanges) {
        try {
          await updateItemStock(change.itemId, change.newStock)
        } catch (stockError) {
          console.error(`Error reducing stock for item ${change.itemId}:`, stockError)
          return NextResponse.json(
            { error: "Failed to update product stock for shipment" },
            { status: 500 }
          )
        }
      }
    }

    // Update order status after any necessary stock changes
    await orderRef.update({ status })

    // Handle stock restoration only if a previously shipped or delivered order is cancelled
    if (status === "cancelled" && (previousStatus === "shipped" || previousStatus === "delivered")) {
      if (!orderData.items || !Array.isArray(orderData.items)) {
        console.warn(`Order ${id} has no valid items array`)
      } else {
        for (const item of orderData.items) {
          if (!item.id || !item.quantity || item.quantity <= 0) {
            console.warn(`Invalid item in order ${id}:`, item)
            continue
          }

          try {
            // Get current stock (handles variants)
            const currentStock = await getItemStock(item.id)
            const newStock = currentStock + item.quantity
            // Restore stock (handles variants)
            await updateItemStock(item.id, newStock)
          } catch (stockError) {
            console.error(`Error restoring stock for item ${item.id}:`, stockError)
            // Continue with other items even if one fails
          }
        }
      }
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
