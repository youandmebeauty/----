"use server"
import { unstable_cache } from "next/cache"
import type { Coffret } from "@/lib/models/models"

const COFFRETS_COLLECTION = "coffrets"

const cachedFunction = unstable_cache(
  async () => {
    const { adminDb } = await import("@/lib/utils/firebase-admin-util")
    const snapshot = await adminDb.collection(COFFRETS_COLLECTION).get()

    return snapshot.docs.map((doc) =>
      JSON.parse(
        JSON.stringify({
          id: doc.id,
          ...doc.data(),
        })
      )
    ) as Coffret[]
  },
  ["coffrets"],
  {
    revalidate: false, // Cache indefinitely until explicitly invalidated
    tags: ["coffrets"], // Tag for cache invalidation
  }
)

// Named export (preferred)
export const getCoffretsCached = cachedFunction

// Alias for backwards compatibility
export const getAllCoffretsCached = cachedFunction

// Default export
export default cachedFunction