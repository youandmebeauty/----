import type { Order} from "@/lib/models"
import { sendOrderConfirmationEmail } from "@/lib/services/email-service"
import { getItemStock } from "@/lib/services/product-service"

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
  // Server-side: Use Firebase Admin SDK (matches API route behavior)
  if (typeof window === "undefined") {
    try {
      const { adminDb } = await import("@/lib/firebase-admin")
      const snapshot = await adminDb
        .collection(ORDERS_COLLECTION)
        .orderBy("createdAt", "desc")
        .get()

      return snapshot.docs.map((doc: any) => {
        const data = doc.data()
        return JSON.parse(
          JSON.stringify({
            id: doc.id,
            ...data,
          }),
        ) as Order
      })
    } catch (error) {
      console.error("Error fetching orders (server):", error)
      return []
    }
  }

  // Client-side: Use Firebase Client SDK
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
    console.error("Error fetching orders (client):", error)
    return []
  }
}

export async function getOrderById(id: string): Promise<Order | null> {
  // Server-side: Use Firebase Admin SDK
  if (typeof window === "undefined") {
    try {
      const { adminDb } = await import("@/lib/firebase-admin")
      const orderDoc = await adminDb.collection(ORDERS_COLLECTION).doc(id).get()

      if (!orderDoc.exists) {
        return null
      }

      const data = orderDoc.data()
      return JSON.parse(
        JSON.stringify({
          id: orderDoc.id,
          ...data,
        }),
      ) as Order
    } catch (error) {
      console.error("Error getting order (server):", error)
      return null
    }
  }

  // Client-side: Use Firebase Client SDK
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
    console.error("Error getting order (client):", error)
    return null
  }
}

export async function createOrder(order: Omit<Order, "id" | "createdAt" | "status">): Promise<Order> {
  try {
    // Call API route to create order (handles stock validation and reduction server-side)
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(order),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to create order")
    }

    const newOrder = await response.json() as Order

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
  try {
    // Call API route to update order status (handles stock restoration server-side)
    const response = await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to update order status")
    }

    return await response.json() as Order
  } catch (error) {
    console.error("Error updating order status:", error)
    throw error
  }
}