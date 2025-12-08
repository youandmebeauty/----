import type { Order} from "@/lib/models"
import { sendOrderConfirmationEmail } from "@/lib/services/email-service"
import { updateProductStock, getProductById } from "@/lib/services/product-service"

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

      const product = await getProductById(item.id)
      
      if (!product) {
        throw new Error(`Product not found: ${item.name}`)
      }

      if (product.quantity === undefined || product.quantity < item.quantity) {
        throw new Error(
          `Stock insuffisant pour ${item.name}. ` +
          `Demandé: ${item.quantity}, Disponible: ${product.quantity ?? 0}`
        )
      }

      // Reduce stock immediately
      const newStock = product.quantity - item.quantity
      await updateProductStock(item.id, newStock)
    }

    // Create order after stock is successfully reduced
    const orderData = {
      ...order,
      status: "pending" as const,
      createdAt: firestoreModule.serverTimestamp(),
    }

    const docRef = await firestoreModule.addDoc(firestoreModule.collection(db, ORDERS_COLLECTION), orderData)

    const newOrder = {
      id: docRef.id,
      ...orderData,
      createdAt: new Date().toISOString(),
    } as Order


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
            const product = await getProductById(item.id)
            if (product && product.quantity !== undefined) {
              const newStock = product.quantity + item.quantity
              await updateProductStock(item.id, newStock)
            } else {
              console.warn(`Product ${item.id} not found or has no stock value`)
            }
          } catch (stockError) {
            console.error(`Error restoring stock for product ${item.id}:`, stockError)
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