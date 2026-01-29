import type { Coffret } from "@/lib/models/models"
import { getRelatedProducts, getProductById } from "./product-service"

const COFFRETS_COLLECTION = "coffrets"

// =============================================================================
// STEP 1: ✅ All in-memory caches DELETED
// =============================================================================

// =============================================================================
// STEP 2 & 3: ✅ All reads now use centralized server cache
// =============================================================================

export async function getCoffrets(): Promise<Coffret[]> {
    try {
        const { getCoffretsCached } = await import("@/lib/server/coffret.server")
        return await getCoffretsCached()
    } catch (error) {
        console.error("Error fetching coffrets via server cache:", error)
        return []
    }
}

export async function getCoffretById(id: string): Promise<Coffret | null> {
    if (!id) return null
    
    const coffrets = await getCoffrets()
    return coffrets.find((c) => c.id === id) ?? null
}

export async function getRelatedCoffrets(
    coffretId: string,
    limit = 4
): Promise<Coffret[]> {
    const coffrets = await getCoffrets()
    const current = coffrets.find(c => c.id === coffretId)

    if (!current || !current.productIds?.length) return []

    // 1️⃣ Collect related product IDs
    const relatedProductIds = new Set<string>()

    for (const productId of current.productIds) {
        const product = await getProductById(productId)
        if (!product) continue

        const relatedProducts = await getRelatedProducts(
            product.id,
            product.category,
            product.brand,
            product.subcategory,
            5
        )

        relatedProducts.forEach(p => relatedProductIds.add(p.id))
    }

    // 2️⃣ Find coffrets with AT LEAST ONE match
    return coffrets
        .filter(c => c.id !== coffretId)
        .filter(c =>
            c.productIds?.some(pid => relatedProductIds.has(pid))
        )
        .slice(0, limit)
}

export async function getCoffretsByIds(ids: string[]): Promise<Coffret[]> {
    if (!ids.length) return []
    
    const coffrets = await getCoffrets()
    return coffrets.filter(c => ids.includes(c.id))
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

// =============================================================================
// STEP 4: ✅ Mutations call API routes (which invalidate cache)
// =============================================================================

export async function createCoffret(
    coffret: Omit<Coffret, "id" | "createdAt" | "updatedAt">
): Promise<Coffret> {
    try {
        const response = await fetch("/api/coffrets", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(coffret),
        })

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || "Failed to create coffret")
        }

        return await response.json()
    } catch (error) {
        console.error("Error creating coffret:", error)
        throw error
    }
}

export async function updateCoffret(
    id: string,
    updates: Partial<Omit<Coffret, "id" | "createdAt">>
): Promise<Coffret> {
    try {
        const response = await fetch(`/api/coffrets/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updates),
        })

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || "Failed to update coffret")
        }

        return await response.json()
    } catch (error) {
        console.error("Error updating coffret:", error)
        throw error
    }
}

export async function deleteCoffret(id: string): Promise<void> {
    try {
        const response = await fetch(`/api/coffrets/${id}`, {
            method: "DELETE",
        })

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || "Failed to delete coffret")
        }
    } catch (error) {
        console.error("Error deleting coffret:", error)
        throw error
    }
}