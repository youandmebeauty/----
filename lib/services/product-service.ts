import { FeaturedProductsServer } from '@/components/featured-products-server';
import type { Product, SearchFilters } from "@/lib/models"
import { SHOP_CATEGORIES } from "@/lib/category-data"

// Create a category order map for sorting
const categoryOrderMap = new Map<string, number>()
SHOP_CATEGORIES.forEach((cat, index) => {
  categoryOrderMap.set(cat.id, index)
})


// =============================================================================
// STEP 1: ✅ All in-memory caches DELETED
// =============================================================================

// Helper function to safely convert createdAt to string for comparison
function getCreatedAtString(product: Product): string {
  const { createdAt } = product
  if (!createdAt) return ""

  if (typeof createdAt === "string") return createdAt
  if (createdAt instanceof Date) return createdAt.toISOString()

  // Firestore Timestamp instance
  if (typeof createdAt === "object" && "toDate" in createdAt) {
    return (createdAt as any).toDate().toISOString()
  }

  // Firestore timestamp plain object
  if (
    typeof createdAt === "object" &&
    "_seconds" in createdAt
  ) {
    return new Date(
      (createdAt as any)._seconds * 1000
    ).toISOString()
  }

  return ""
}

const getCreatedAtMillis = (product: Product): number => {
  const ts: any = product.createdAt
  if (!ts) return 0

  // Firebase Admin SDK serialized Timestamp
  if (typeof ts._seconds === "number") {
    return ts._seconds * 1000
  }

  // Firestore client Timestamp (just in case)
  if (typeof ts.toMillis === "function") {
    return ts.toMillis()
  }

  // Date or string fallback
  return new Date(ts).getTime() || 0
}


// =============================================================================
// STEP 2 & 3: ✅ All reads now use centralized server cache
// =============================================================================

export async function getProducts(): Promise<Product[]> {
  try {
    const { getProductsCached } = await import("@/lib/products.server")
    return await getProductsCached()
  } catch (error) {
    console.error("Error fetching products via server cache:", error)
    return []
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  const products = await getProducts()
  return products.find((p) => p.id === id) ?? null
}

export async function getFeaturedProducts(limitCount = 1): Promise<Product[]> {
  const products = await getProducts()
  return products
  .filter(p => p.featured)
  .map(p => ({ ...p, _createdAt: getCreatedAtString(p) }))
  .sort((a, b) => b._createdAt.localeCompare(a._createdAt))
  .slice(0, limitCount)
  .map(({ _createdAt, ...p }) => p)

}


export async function getRelatedProducts(
  productId: string,
  category: string,
  brand: string,
  subcategory?: string,
  limitCount = 7
): Promise<Product[]> {
  try {
    const products = await getProducts()
    
    // First, get products of the same brand AND subcategory (if provided)
    let brandProducts = products.filter((p) => {
      if (p.id === productId) return false
      if (p.brand !== brand) return false
      if (subcategory && p.subcategory !== subcategory) return false
      return true
    })
    
    // Sort by createdAt descending
    brandProducts = brandProducts.sort((a, b) => 
      getCreatedAtString(b).localeCompare(getCreatedAtString(a))
    )
    
    // If we don't have enough products from the same brand+subcategory, get products from the same category
    if (brandProducts.length < limitCount) {
      let categoryProducts = products.filter((p) => {
        if (p.id === productId) return false
        if (p.brand === brand) return false // Already included
        if (p.category !== category) return false
        if (subcategory && p.subcategory !== subcategory) return false
        if (brandProducts.some(bp => bp.id === p.id)) return false // Avoid duplicates
        return true
      })
      
      categoryProducts = categoryProducts.sort((a, b) => 
        getCreatedAtString(b).localeCompare(getCreatedAtString(a))
      )
      
      brandProducts = [...brandProducts, ...categoryProducts]
    }
    
    return brandProducts.slice(0, limitCount)
  } catch (error) {
    console.error("Error fetching related products:", error)
    return []
  }
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  try {
    const products = await getProducts()
    return products
      .filter((p) => p.category === category)
      .sort((a, b) => getCreatedAtString(b).localeCompare(getCreatedAtString(a)))
  } catch (error) {
    console.error("Error fetching products by category:", error)
    return []
  }
}

export async function searchProducts(searchTerm: string, filters?: SearchFilters): Promise<Product[]> {
  try {
    let products = await getProducts()

    // Apply filters
    if (filters?.category) {
      products = products.filter((p) => p.category === filters.category)
    }

    if (filters?.subcategory) {
      products = products.filter((p) => p.subcategory === filters.subcategory)
    }

    if (filters?.skinType && filters.skinType.length > 0) {
      products = products.filter((p) => {
        const skinTypes = (p.skinType || []) as string[]
        return skinTypes.some((t) => filters.skinType!.includes(t))
      })
    }

    if (filters?.hairType && filters.hairType.length > 0) {
      products = products.filter((p) => {
        const hairTypes = (p.hairType || []) as string[]
        return hairTypes.some((t) => filters.hairType!.includes(t))
      })
    }

    if (filters?.minPrice !== undefined) {
      products = products.filter((p) => p.price >= (filters.minPrice as number))
    }

    if (filters?.maxPrice !== undefined) {
      products = products.filter((p) => p.price <= (filters.maxPrice as number))
    }

    if (filters?.ingredients && filters.ingredients.length > 0) {
      products = products.filter((p) => {
        const ingredients = (p.ingredients || []) as string[]
        return ingredients.some((ing) => filters.ingredients!.includes(ing))
      })
    }

    if (filters?.brand && filters.brand.length > 0) {
      products = products.filter((p: any) => {
        const brandValue = p.brand
        if (Array.isArray(brandValue)) {
          return brandValue.some((b) => filters.brand!.includes(b))
        }
        return filters.brand!.includes(brandValue)
      })
    }

    // Apply search term
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase()
      products = products.filter((product: Product): boolean =>
        product.name.toLowerCase().includes(lowerSearchTerm) ||
        (product.description || "").toLowerCase().includes(lowerSearchTerm) ||
        (product.ingredients || []).some((ing: string) => ing.toLowerCase().includes(lowerSearchTerm)) ||
        (product.brand || "").toLowerCase().includes(lowerSearchTerm) ||
        (product.skinType || []).some((type: string) => type.toLowerCase().includes(lowerSearchTerm)) ||
        (product.hairType || []).some((type: string) => type.toLowerCase().includes(lowerSearchTerm)) ||
        (product.perfumeNotes?.top || []).some((note: string) => note.toLowerCase().includes(lowerSearchTerm)) ||
        (product.perfumeNotes?.heart || []).some((note: string) => note.toLowerCase().includes(lowerSearchTerm)) ||
        (product.perfumeNotes?.base || []).some((note: string) => note.toLowerCase().includes(lowerSearchTerm)),
      )
    }

    // Apply sorting
    if (filters?.sortBy) {
      switch (filters.sortBy) {
case "featured": {
  const sorted = products
    .filter(p => p.featured)
    .map(p => ({ ...p, _createdAt: getCreatedAtString(p) }))
    .sort((a, b) => b._createdAt.localeCompare(a._createdAt))
    .map(({ _createdAt, ...p }) => p)

  products = sorted
  break
}


        case "price-asc":
          products = [...products].sort((a, b) => a.price - b.price)
          break
        case "price-desc":
          products = [...products].sort((a, b) => b.price - a.price)
          break

        case "newest":
          products = [...products].sort(
            (a, b) => getCreatedAtMillis(b) - getCreatedAtMillis(a)
          )
          break

        default: 
          break
      }
    } 

    return products
  } catch (error) {
    console.error("Error searching products:", error)
    return []
  }
}

// =============================================================================
// STEP 4: ✅ Mutations call API routes (which invalidate cache)
// =============================================================================

export async function createProduct(product: Omit<Product, "id" | "createdAt" | "updatedAt">): Promise<Product> {
  try {
    const response = await fetch("/api/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(product),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to create product")
    }

    return await response.json()
  } catch (error) {
    console.error("Error creating product:", error)
    throw error
  }
}

export async function updateProduct(
  id: string,
  product: Partial<Omit<Product, "id" | "createdAt" | "updatedAt">>,
): Promise<Product> {
  try {
    const response = await fetch(`/api/products/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(product),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to update product")
    }

    return await response.json()
  } catch (error) {
    console.error("Error updating product:", error)
    throw error
  }
}

export async function deleteProduct(id: string): Promise<void> {
  try {
    const response = await fetch(`/api/products/${id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to delete product")
    }
  } catch (error) {
    console.error("Error deleting product:", error)
    throw error
  }
}

// =============================================================================
// Item ID parsing and stock management
// =============================================================================

// Helper function to parse item ID and extract product ID and variant index
// Format: productId-variantIndex (e.g., "abc123-0", "product-with-dashes-2")
export function parseItemId(itemId: string): { productId: string; variantIndex: number | null } {
  // Try to find the last occurrence of a pattern like "-N" where N is a number
  const match = itemId.match(/^(.+)-(\d+)$/)
  if (match) {
    const productId = match[1]
    const variantIndex = parseInt(match[2], 10)
    if (!isNaN(variantIndex) && variantIndex >= 0) {
      return { productId, variantIndex }
    }
  }
  // If no variant pattern found, it's just a product ID
  return { productId: itemId, variantIndex: null }
}

// Get stock for an item (handles variants)
export async function getItemStock(itemId: string): Promise<number> {
  try {
    const { productId, variantIndex } = parseItemId(itemId)
    
    const product = await getProductById(productId)
    
    if (!product) {
      console.warn(`[getItemStock] Product not found: ${productId} (parsed from ${itemId})`)
      return 0
    }

    // If it's a variant, return the variant's stock
    if (variantIndex !== null) {
      if (!product.hasColorVariants || !product.colorVariants) {
        console.warn(`[getItemStock] Product ${productId} doesn't have color variants but variantIndex is ${variantIndex}`)
        return 0
      }
      
      if (variantIndex < 0 || variantIndex >= product.colorVariants.length) {
        console.warn(`[getItemStock] Invalid variantIndex ${variantIndex} for product ${productId} (has ${product.colorVariants.length} variants)`)
        return 0
      }
      
      const variant = product.colorVariants[variantIndex]
      if (!variant) {
        console.warn(`[getItemStock] Variant ${variantIndex} is null/undefined for product ${productId}`)
        return 0
      }
      
      // Check if quantity exists and is a valid number
      const stock = typeof variant.quantity === 'number' ? variant.quantity : (parseInt(String(variant.quantity || 0), 10) || 0)
      return stock
    }

    // Otherwise return the product's stock
    const stock = product.quantity ?? 0
    return stock
  } catch (error) {
    console.error(`[getItemStock] Error getting stock for itemId ${itemId}:`, error)
    return 0
  }
}

// Update stock for an item (handles variants)
export async function updateItemStock(itemId: string, quantity: number): Promise<void> {
  const { productId, variantIndex } = parseItemId(itemId)
  
  // If it's a variant, update the variant's stock
  if (variantIndex !== null) {
    await updateVariantStock(productId, variantIndex, quantity)
  } else {
    // Otherwise update the product's stock
    await updateProductStock(productId, quantity)
  }
}

// Update product stock via API route
export async function updateProductStock(id: string, quantity: number): Promise<void> {
  try {
    const response = await fetch(`/api/products/${id}/stock`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ quantity }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to update product stock")
    }
  } catch (error) {
    console.error("Error updating product stock:", error)
    throw error
  }
}

// Update variant stock via API route
export async function updateVariantStock(productId: string, variantIndex: number, quantity: number): Promise<void> {
  try {
    const response = await fetch(`/api/products/${productId}/variants/${variantIndex}/stock`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ quantity }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to update variant stock")
    }
  } catch (error) {
    console.error("Error updating variant stock:", error)
    throw error
  }
}