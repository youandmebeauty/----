import type { Order} from "@/lib/models"
import { sendOrderConfirmationEmail } from "@/lib/services/email-service"
import { updateItemStock, getItemStock } from "@/lib/services/product-service"
import { incrementPromoCodeUsage } from "@/lib/services/promo-code-service"

// Dynamic imports for client-side Firebase
let firestoreModule: any = null
let db: any = null

const initFirestore = async () => {
  if (typeof window !== "undefined" && !firestoreModule) {
    const { db: database } = await import("@/lib/firebase")
    const { collection, getDocs, getDoc, doc, query, orderBy, addDoc, updateDoc, serverTimestamp } = await import(
      "firebase/firestore"
    )

    firestoreModule = {
      collection,
      getDocs,
      getDoc,
      doc,
      query,
      orderBy,
      addDoc,
      updateDoc,
      serverTimestamp,
    }
    db = database
  }
}

const ORDERS_COLLECTION = "orders"

export async function getOrders(): Promise<Order[]> {
  await initFirestore()
  if (!firestoreModule || !db) return []

  try {
    const ordersRef = firestoreModule.collection(db, ORDERS_COLLECTION)
    const q = firestoreModule.query(ordersRef, firestoreModule.orderBy("createdAt", "desc"))
    const snapshot = await firestoreModule.getDocs(q)

    return snapshot.docs.map(
      (doc: any) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as Order,
    )
  } catch (error) {
    console.error("Error fetching orders:", error)
    return []
  }
}

export async function getOrderById(id: string): Promise<Order | null> {
  await initFirestore()
  if (!firestoreModule || !db) return null

  try {
    const orderRef = firestoreModule.doc(db, ORDERS_COLLECTION, id)
    const orderDoc = await firestoreModule.getDoc(orderRef)

    if (!orderDoc.exists()) {
      return null
    }

    return {
      id: orderDoc.id,
      ...orderDoc.data(),
    } as Order
  } catch (error) {
    console.error("Error getting order:", error)
    return null
  }
}

export async function createOrder(order: Omit<Order, "id" | "createdAt" | "status">): Promise<Order> {
  await initFirestore()
  if (!firestoreModule || !db) throw new Error("Firestore not available")

  try {
    // VALIDATE AND REDUCE STOCK BEFORE CREATING ORDER
    
    for (const item of order.items) {
      if (!item.id || !item.quantity || item.quantity <= 0) {
        throw new Error(`Invalid item: ${item.name || 'Unknown'}`)
      }

      // Get stock for the item (handles variants)
      const availableStock = await getItemStock(item.id)
      
      if (availableStock < item.quantity) {
        throw new Error(
          `Stock insuffisant pour ${item.name}. ` +
          `Demandé: ${item.quantity}, Disponible: ${availableStock}`
        )
      }

      // Reduce stock immediately (handles variants)
      const newStock = availableStock - item.quantity
      await updateItemStock(item.id, newStock)
    }

    // Create order after stock is successfully reduced
    // Remove undefined fields as Firestore doesn't accept them
    const orderData: any = {
      customerName: order.customerName,
      email: order.email,
      phone: order.phone || null,
      address: order.address,
      city: order.city,
      postalCode: order.postalCode,
      gouvernorat: order.gouvernorat,
      items: order.items,
      total: order.total,
      status: "pending" as const,
      createdAt: firestoreModule.serverTimestamp(),
    }

    // Only include optional fields if they have values
    if (order.notes) {
      orderData.notes = order.notes
    }
    if (order.promoCode) {
      orderData.promoCode = order.promoCode
    }
    if (order.discount !== undefined && order.discount > 0) {
      orderData.discount = order.discount
    }

    const docRef = await firestoreModule.addDoc(firestoreModule.collection(db, ORDERS_COLLECTION), orderData)

    const newOrder = {
      id: docRef.id,
      ...orderData,
      createdAt: new Date().toISOString(),
    } as Order

    // Increment promo code usage if a promo code was used
    if (order.promoCode) {
      try {
        await incrementPromoCodeUsage(order.promoCode)
      } catch (promoError) {
        console.error("Error incrementing promo code usage:", promoError)
        // Don't throw error for promo tracking failure, order was created successfully
      }
    }

    // Send confirmation emails
    try {
      await sendOrderConfirmationEmail(newOrder)
    } catch (emailError) {
      console.error("Error sending confirmation email:", emailError)
      // Don't throw error for email failure, order was created successfully
    }

    return newOrder
  } catch (error) {
    console.error("Error creating order:", error)
    throw error
  }
}

export async function updateOrderStatus(id: string, status: Order["status"]): Promise<Order> {
  await initFirestore()
  if (!firestoreModule || !db) {
    console.error("Firestore not initialized")
    throw new Error("Firestore not available")
  }

  try {
    const orderRef = firestoreModule.doc(db, ORDERS_COLLECTION, id)
    const orderDoc = await firestoreModule.getDoc(orderRef)

    if (!orderDoc.exists()) {
      console.warn(`Order ${id} not found`)
      throw new Error("Order not found")
    }

    const orderData = orderDoc.data() as Order
    const previousStatus = orderData.status


    // Update order status in database
    await firestoreModule.updateDoc(orderRef, { status })

    // Handle stock restoration if order is cancelled
    if (status === "cancelled" && previousStatus !== "cancelled") {
      
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

    return {
      id,
      ...orderDoc.data(),
      status,
    } as Order
  } catch (error) {
    console.error("Error updating order status:", error)
    throw error
  }
}