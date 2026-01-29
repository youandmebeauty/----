"use server"
import { unstable_cache } from "next/cache"
import type { Product } from "@/lib/models"

const PRODUCTS_COLLECTION = "products"
const cachedFunction = unstable_cache(
  async () => {
    const { adminDb } = await import("@/lib/firebase-admin")
    const snapshot = await adminDb.collection(PRODUCTS_COLLECTION).get()

    return snapshot.docs.map((doc) =>
      JSON.parse(
        JSON.stringify({
          id: doc.id,
          ...doc.data(),
        })
      )
    ) as Product[]
  },
  ["products"],
  {
    revalidate: false, // Cache indefinitely until explicitly invalidated
    tags: ["products"], // Tag for cache invalidation
  }
)

// Named export (preferred)
export const getProductsCached = cachedFunction

// Alias for backwards compatibility
export const getAllProductsCached = cachedFunction

// Default export
export default cachedFunction