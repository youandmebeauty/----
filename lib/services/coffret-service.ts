import type { Coffret } from "@/lib/models"

const COFFRETS_COLLECTION = "coffrets"

// Enhanced cache with TTL
interface CacheEntry<T> {
    data: T
    timestamp: number
}

const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

class CoffretCache {
    private cache = new Map<string, CacheEntry<Coffret>>()
    private allCoffretsCache: CacheEntry<Coffret[]> | null = null

    get(id: string): Coffret | null {
        const entry = this.cache.get(id)
        if (!entry) return null
        
        if (Date.now() - entry.timestamp > CACHE_TTL) {
            this.cache.delete(id)
            return null
        }
        
        return entry.data
    }

    set(id: string, data: Coffret): void {
        this.cache.set(id, {
            data,
            timestamp: Date.now()
        })
    }

    getAll(): Coffret[] | null {
        if (!this.allCoffretsCache) return null
        
        if (Date.now() - this.allCoffretsCache.timestamp > CACHE_TTL) {
            this.allCoffretsCache = null
            return null
        }
        
        return this.allCoffretsCache.data
    }

    setAll(data: Coffret[]): void {
        this.allCoffretsCache = {
            data,
            timestamp: Date.now()
        }
    }

    clear(id?: string): void {
        if (id) {
            this.cache.delete(id)
        } else {
            this.cache.clear()
            this.allCoffretsCache = null
        }
    }
}

const cache = new CoffretCache()

export function clearCoffretCache(id?: string) {
    cache.clear(id)
}

// Dynamic imports for client-side Firebase
let firestoreModule: any = null
let db: any = null
let isInitializing = false
let initPromise: Promise<void> | null = null

const initFirestore = async () => {
    if (typeof window === "undefined") return
    if (firestoreModule && db) return
    if (isInitializing && initPromise) return initPromise

    isInitializing = true
    initPromise = (async () => {
        try {
            const { db: database } = await import("@/lib/firebase")
            const {
                collection,
                getDocs,
                getDoc,
                addDoc,
                updateDoc,
                deleteDoc,
                doc,
                query,
                orderBy,
                serverTimestamp,
                Timestamp
            } = await import("firebase/firestore")

            firestoreModule = {
                collection,
                getDocs,
                getDoc,
                addDoc,
                updateDoc,
                deleteDoc,
                doc,
                query,
                orderBy,
                serverTimestamp,
                Timestamp
            }
            db = database
        } finally {
            isInitializing = false
            initPromise = null
        }
    })()

    return initPromise
}

// Helper to convert Firestore timestamps
function convertTimestamps(data: any): any {
    const converted = { ...data }
    
    if (data.createdAt?.toDate) {
        converted.createdAt = data.createdAt.toDate().toISOString()
    } else if (data.createdAt && typeof data.createdAt === 'object' && 'seconds' in data.createdAt) {
        converted.createdAt = new Date(data.createdAt.seconds * 1000).toISOString()
    }
    
    if (data.updatedAt?.toDate) {
        converted.updatedAt = data.updatedAt.toDate().toISOString()
    } else if (data.updatedAt && typeof data.updatedAt === 'object' && 'seconds' in data.updatedAt) {
        converted.updatedAt = new Date(data.updatedAt.seconds * 1000).toISOString()
    }
    
    return converted
}

export async function getCoffrets(): Promise<Coffret[]> {
    const cached = cache.getAll()
    if (cached) return cached

    // Server-side
    if (typeof window === "undefined") {
        try {
            const { adminDb } = await import("@/lib/firebase-admin")
            const snapshot = await adminDb
                .collection(COFFRETS_COLLECTION)
                .orderBy("createdAt", "desc")
                .get()
            
            const coffrets = snapshot.docs.map((doc: any) => {
                const data = convertTimestamps(doc.data())
                return {
                    id: doc.id,
                    ...data
                }
            }) as Coffret[]
            
            cache.setAll(coffrets)
            return coffrets
        } catch (error) {
            console.error("Error fetching coffrets (server):", error)
            return []
        }
    }

    // Client-side
    await initFirestore()
    if (!firestoreModule || !db) {
        console.warn("Firebase not initialized on client")
        return []
    }

    try {
        const q = firestoreModule.query(
            firestoreModule.collection(db, COFFRETS_COLLECTION),
            firestoreModule.orderBy("createdAt", "desc")
        )
        const snapshot = await firestoreModule.getDocs(q)
        const coffrets = snapshot.docs.map((doc: any) => {
            const data = convertTimestamps(doc.data())
            return {
                id: doc.id,
                ...data
            }
        }) as Coffret[]
        
        cache.setAll(coffrets)
        return coffrets
    } catch (error) {
        console.error("Error fetching coffrets (client):", error)
        return []
    }
}

export async function getCoffretById(id: string): Promise<Coffret | null> {
    if (!id) return null
    
    const cached = cache.get(id)
    if (cached) return cached

    // Server-side
    if (typeof window === "undefined") {
        try {
            const { adminDb } = await import("@/lib/firebase-admin")
            const doc = await adminDb.collection(COFFRETS_COLLECTION).doc(id).get()
            if (!doc.exists) return null
            
            const data = convertTimestamps(doc.data())
            const coffret = { id: doc.id, ...data } as Coffret
            cache.set(id, coffret)
            return coffret
        } catch (error) {
            console.error("Error fetching coffret (server):", error)
            return null
        }
    }

    // Client-side
    await initFirestore()
    if (!firestoreModule || !db) return null

    try {
        const docRef = firestoreModule.doc(db, COFFRETS_COLLECTION, id)
        const docSnap = await firestoreModule.getDoc(docRef)
        if (!docSnap.exists()) return null

        const data = convertTimestamps(docSnap.data())
        const coffret = { id: docSnap.id, ...data } as Coffret
        cache.set(id, coffret)
        return coffret
    } catch (error) {
        console.error("Error fetching coffret (client):", error)
        return null
    }
}

export async function createCoffret(
    coffret: Omit<Coffret, "id" | "createdAt" | "updatedAt">
): Promise<Coffret> {
    await initFirestore()
    if (!firestoreModule || !db) {
        throw new Error("Firebase not initialized")
    }

    // Validate coffret data
    if (!coffret.name?.trim()) {
        throw new Error("Coffret name is required")
    }
    if (!coffret.price || coffret.price < 0) {
        throw new Error("Valid price is required")
    }
    if (!Array.isArray(coffret.productIds) || coffret.productIds.length === 0) {
        throw new Error("At least one product is required")
    }

    try {
        // Compute originalPrice from selected product prices
        let originalPrice = 0
        try {
            const { getProductById } = await import("./product-service")
            if (Array.isArray(coffret.productIds) && coffret.productIds.length > 0) {
                const proms = coffret.productIds.map((id) => getProductById(id))
                const products = await Promise.all(proms)
                originalPrice = products.reduce((sum, p) => sum + (p?.price ?? 0), 0)
            }
        } catch (err) {
            console.error("Failed computing originalPrice during createCoffret:", err)
        }

        const docRef = await firestoreModule.addDoc(
            firestoreModule.collection(db, COFFRETS_COLLECTION),
            {
                ...coffret,
                originalPrice,
                createdAt: firestoreModule.serverTimestamp(),
                updatedAt: firestoreModule.serverTimestamp()
            }
        )

        const newCoffret = {
            id: docRef.id,
            ...coffret,
            originalPrice,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        } as Coffret

        cache.clear()
        return newCoffret
    } catch (error) {
        console.error("Error creating coffret:", error)
        throw new Error("Failed to create coffret")
    }
}

export async function updateCoffret(
    id: string,
    updates: Partial<Omit<Coffret, "id" | "createdAt">>
): Promise<void> {
    if (!id) throw new Error("Coffret ID is required")
    
    await initFirestore()
    if (!firestoreModule || !db) {
        throw new Error("Firebase not initialized")
    }

    // Validate updates
    if (updates.price !== undefined && updates.price < 0) {
        throw new Error("Price cannot be negative")
    }
    if (updates.productIds !== undefined && (!Array.isArray(updates.productIds) || updates.productIds.length === 0)) {
        throw new Error("At least one product is required")
    }

    try {
        const docRef = firestoreModule.doc(db, COFFRETS_COLLECTION, id)

        // Remove undefined values
        const cleanUpdates = Object.fromEntries(
            Object.entries(updates).filter(([_, v]) => v !== undefined)
        )

        // If productIds are being updated, recompute originalPrice
        if (updates.productIds !== undefined) {
            try {
                const { getProductById } = await import("./product-service")
                const proms = (updates.productIds || []).map((pid: string) => getProductById(pid))
                const products = await Promise.all(proms)
                const originalPrice = products.reduce((sum, p) => sum + (p?.price ?? 0), 0)
                ;(cleanUpdates as any).originalPrice = originalPrice
            } catch (err) {
                console.error("Failed computing originalPrice during updateCoffret:", err)
            }
        }

        await firestoreModule.updateDoc(docRef, {
            ...cleanUpdates,
            updatedAt: firestoreModule.serverTimestamp()
        })

        cache.clear(id)
    } catch (error) {
        console.error("Error updating coffret:", error)
        throw new Error("Failed to update coffret")
    }
}

export async function deleteCoffret(id: string): Promise<void> {
    if (!id) throw new Error("Coffret ID is required")
    
    await initFirestore()
    if (!firestoreModule || !db) {
        throw new Error("Firebase not initialized")
    }

    try {
        await firestoreModule.deleteDoc(
            firestoreModule.doc(db, COFFRETS_COLLECTION, id)
        )
        cache.clear(id)
    } catch (error) {
        console.error("Error deleting coffret:", error)
        throw new Error("Failed to delete coffret")
    }
}

// Batch operations
export async function getCoffretsByIds(ids: string[]): Promise<Coffret[]> {
    if (!ids.length) return []
    
    const coffrets = await Promise.all(
        ids.map(id => getCoffretById(id))
    )
    
    return coffrets.filter((c): c is Coffret => c !== null)
}

export async function searchCoffrets(searchTerm: string): Promise<Coffret[]> {
    const allCoffrets = await getCoffrets()
    
    if (!searchTerm.trim()) return allCoffrets
    
    const term = searchTerm.toLowerCase()
    return allCoffrets.filter(coffret =>
        coffret.name.toLowerCase().includes(term) ||
        coffret.description?.toLowerCase().includes(term)
    )
}