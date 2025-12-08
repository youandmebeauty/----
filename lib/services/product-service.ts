import type { Product, SearchFilters } from "@/lib/models"

// Dynamic imports for client-side Firebase
let firestoreModule: any = null
let db: any = null

const initFirestore = async () => {
  if (typeof window !== "undefined" && !firestoreModule) {
    const { db: database } = await import("@/lib/firebase")
    const {
      collection,
      getDocs,
      getDoc,
      doc,
      query,
      where,
      orderBy,
      addDoc,
      updateDoc,
      deleteDoc,
      serverTimestamp,
      limit,
    } = await import("firebase/firestore")

    firestoreModule = {
      collection,
      getDocs,
      getDoc,
      doc,
      query,
      where,
      orderBy,
      addDoc,
      updateDoc,
      deleteDoc,
      serverTimestamp,
      limit,
    }
    db = database
  }
}

const PRODUCTS_COLLECTION = "products"

export async function getProducts(): Promise<Product[]> {
  await initFirestore()
  if (!firestoreModule || !db) return []

  try {
    const productsRef = firestoreModule.collection(db, PRODUCTS_COLLECTION)
    const snapshot = await firestoreModule.getDocs(productsRef)

    return snapshot.docs.map(
      (doc: any) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as Product,
    )
  } catch (error) {
    console.error("Error fetching products:", error)
    return []
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  // Server-side: Use Firebase Admin SDK
  if (typeof window === "undefined") {
    try {
      const { adminDb } = await import("@/lib/firebase-admin")
      const productDoc = await adminDb.collection(PRODUCTS_COLLECTION).doc(id).get()

      if (!productDoc.exists) {
        return null
      }

      // Serialize to plain object to avoid Next.js serialization errors
      const data = productDoc.data()
      return JSON.parse(JSON.stringify({
        id: productDoc.id,
        ...data,
      })) as Product
    } catch (error) {
      console.error("Error getting product (server):", error)
      return null
    }
  }

  // Client-side: Use Firebase Client SDK
  await initFirestore()
  if (!firestoreModule || !db) return null

  try {
    const productRef = firestoreModule.doc(db, PRODUCTS_COLLECTION, id)
    const productDoc = await firestoreModule.getDoc(productRef)

    if (!productDoc.exists()) {
      return null
    }

    const data = productDoc.data()
    const product = {
      id: productDoc.id,
      ...data,
    } as Product
    
    // Debug: Log colorVariants if they exist
    if (product.hasColorVariants && product.colorVariants) {
      console.log(`[getProductById-client] Product ${product.id} has ${product.colorVariants.length} color variants:`, product.colorVariants)
      product.colorVariants.forEach((variant, idx) => {
        console.log(`[getProductById-client] Variant ${idx}:`, {
          colorName: variant.colorName,
          quantity: variant.quantity,
          quantityType: typeof variant.quantity,
          fullVariant: variant
        })
      })
    }
    
    return product
  } catch (error) {
    console.error("Error getting product (client):", error)
    return null
  }
}

export async function getFeaturedProducts(limitCount = 4): Promise<Product[]> {
  await initFirestore()
  if (!firestoreModule || !db) return []

  try {
    const productsRef = firestoreModule.collection(db, PRODUCTS_COLLECTION)
    const q = firestoreModule.query(
      productsRef,
      firestoreModule.where("featured", "==", true),
      firestoreModule.orderBy("createdAt", "desc"),
      firestoreModule.limit(limitCount),
    )

    const snapshot = await firestoreModule.getDocs(q)

    return snapshot.docs.map(
      (doc: any) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as Product,
    )
  } catch (error) {
    console.error("Error fetching featured products:", error)
    return []
  }
}

export async function getRelatedProducts(
  productId: string,
  category: string,
  brand: string,
  subcategory?: string,
  limitCount = 4
): Promise<Product[]> {
  // Server-side: Use Firebase Admin SDK
  if (typeof window === "undefined") {
    try {
      const { adminDb } = await import("@/lib/firebase-admin")
      
      // First, try to get products of the same brand
      let brandQuery = adminDb.collection(PRODUCTS_COLLECTION).where("brand", "==", brand)
      const brandSnapshot = await brandQuery.orderBy("createdAt", "desc").limit(limitCount * 2).get()
      
      let products: Product[] = brandSnapshot.docs
        .map((doc) => {
          const data = doc.data()
          return JSON.parse(JSON.stringify({
            id: doc.id,
            ...data,
          })) as Product
        })
        .filter((product: Product) => product.id !== productId)
      
      // If we don't have enough products from the same brand, get products from the same category
      if (products.length < limitCount) {
        let categoryQuery = adminDb.collection(PRODUCTS_COLLECTION).where("category", "==", category)
        
        if (subcategory) {
          categoryQuery = categoryQuery.where("subcategory", "==", subcategory)
        }
        
        const categorySnapshot = await categoryQuery.orderBy("createdAt", "desc").limit(limitCount * 3).get()
        
        const categoryProducts = categorySnapshot.docs
          .map((doc) => {
            const data = doc.data()
            return JSON.parse(JSON.stringify({
              id: doc.id,
              ...data,
            })) as Product
          })
          .filter((product: Product) => 
            product.id !== productId && 
            product.brand !== brand && // Exclude products from the same brand (already included)
            !products.some(p => p.id === product.id) // Avoid duplicates
          )
        
        products = [...products, ...categoryProducts]
      }
      
      return products.slice(0, limitCount)
    } catch (error) {
      console.error("Error fetching related products (server):", error)
      return []
    }
  }

  // Client-side: Use Firebase Client SDK
  await initFirestore()
  if (!firestoreModule || !db) return []

  try {
    // First, try to get products of the same brand
    const brandRef = firestoreModule.collection(db, PRODUCTS_COLLECTION)
    const brandConstraints: any[] = [
      firestoreModule.where("brand", "==", brand),
      firestoreModule.orderBy("createdAt", "desc"),
      firestoreModule.limit(limitCount * 2),
    ]
    
    const brandQuery = firestoreModule.query(brandRef, ...brandConstraints)
    const brandSnapshot = await firestoreModule.getDocs(brandQuery)
    
    let products: Product[] = brandSnapshot.docs
      .map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
      } as Product))
      .filter((product: Product) => product.id !== productId)
    
    // If we don't have enough products from the same brand, get products from the same category
    if (products.length < limitCount) {
      const categoryRef = firestoreModule.collection(db, PRODUCTS_COLLECTION)
      const categoryConstraints: any[] = [
        firestoreModule.where("category", "==", category),
      ]
      
      if (subcategory) {
        categoryConstraints.push(firestoreModule.where("subcategory", "==", subcategory))
      }
      
      categoryConstraints.push(firestoreModule.orderBy("createdAt", "desc"))
      categoryConstraints.push(firestoreModule.limit(limitCount * 3))
      
      const categoryQuery = firestoreModule.query(categoryRef, ...categoryConstraints)
      const categorySnapshot = await firestoreModule.getDocs(categoryQuery)
      
      const categoryProducts = categorySnapshot.docs
        .map((doc: any) => ({
          id: doc.id,
          ...doc.data(),
        } as Product))
        .filter((product: Product) => 
          product.id !== productId && 
          product.brand !== brand && // Exclude products from the same brand (already included)
          !products.some(p => p.id === product.id) // Avoid duplicates
        )
      
      products = [...products, ...categoryProducts]
    }
    
    return products.slice(0, limitCount)
  } catch (error) {
    console.error("Error fetching related products (client):", error)
    return []
  }
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  await initFirestore()
  if (!firestoreModule || !db) return []

  try {
    const productsRef = firestoreModule.collection(db, PRODUCTS_COLLECTION)
    const q = firestoreModule.query(
      productsRef,
      firestoreModule.where("category", "==", category),
      firestoreModule.orderBy("createdAt", "desc"),
    )

    const snapshot = await firestoreModule.getDocs(q)

    return snapshot.docs.map(
      (doc: any) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as Product,
    )
  } catch (error) {
    console.error("Error fetching products by category:", error)
    return []
  }
}

export async function searchProducts(searchTerm: string, filters?: SearchFilters): Promise<Product[]> {
  await initFirestore()
  if (!firestoreModule || !db) return []

  try {
    const productsRef = firestoreModule.collection(db, PRODUCTS_COLLECTION)
    const constraints: any[] = []

    // Add filters
    if (filters?.category) {
      constraints.push(firestoreModule.where("category", "==", filters.category))
    }

    if (filters?.subcategory) {
      constraints.push(firestoreModule.where("subcategory", "==", filters.subcategory))
    }

    if (filters?.skinType && filters.skinType.length > 0) {
      constraints.push(firestoreModule.where("skinType", "array-contains-any", filters.skinType))
    }

    if (filters?.hairType && filters.hairType.length > 0) {
      constraints.push(firestoreModule.where("hairType", "array-contains-any", filters.hairType))
    }

    if (filters?.minPrice !== undefined) {
      constraints.push(firestoreModule.where("price", ">=", filters.minPrice))
    }

    if (filters?.maxPrice !== undefined) {
      constraints.push(firestoreModule.where("price", "<=", filters.maxPrice))
    }

    if (filters?.ingredients && filters.ingredients.length > 0) {
      constraints.push(firestoreModule.where("ingredients", "array-contains-any", filters.ingredients))
    }

    if (filters?.brand && filters.brand.length > 0) {
      constraints.push(firestoreModule.where("brand", "array-contains-any", filters.brand))
    }

    // Add sorting
    if (filters?.sortBy) {
      switch (filters.sortBy) {
        case "price-asc":
          constraints.push(firestoreModule.orderBy("price", "asc"))
          break
        case "price-desc":
          constraints.push(firestoreModule.orderBy("price", "desc"))
          break
        case "name-asc":
          constraints.push(firestoreModule.orderBy("name", "asc"))
          break
        case "name-desc":
          constraints.push(firestoreModule.orderBy("name", "desc"))
          break
        case "newest":
          constraints.push(firestoreModule.orderBy("createdAt", "desc"))
          break
        default:
          constraints.push(firestoreModule.orderBy("createdAt", "desc"))
      }
    } else {
      constraints.push(firestoreModule.orderBy("createdAt", "desc"))
    }

    const q = firestoreModule.query(productsRef, ...constraints)
    const snapshot = await firestoreModule.getDocs(q)

    let products = snapshot.docs.map(
      (doc: any) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as Product,
    )

    // Client-side search for text matching
if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase()
      products = products.filter(
        (product: Product): boolean =>
          product.name.toLowerCase().includes(lowerSearchTerm) ||
          product.description.toLowerCase().includes(lowerSearchTerm) ||
          (product.ingredients || []).some((ing: string) => ing.toLowerCase().includes(lowerSearchTerm)) ||
          product.brand.toLowerCase().includes(lowerSearchTerm),
      )
    }

    return products
  } catch (error) {
    console.error("Error searching products:", error)
    return []
  }
}

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
    console.log(`[getItemStock] Parsing itemId: ${itemId} -> productId: ${productId}, variantIndex: ${variantIndex}`)
    
    const product = await getProductById(productId)
    
    if (!product) {
      console.warn(`[getItemStock] Product not found: ${productId} (parsed from ${itemId})`)
      return 0
    }

    console.log(`[getItemStock] Product found: ${product.name}, hasColorVariants: ${product.hasColorVariants}, colorVariants length: ${product.colorVariants?.length || 0}`)

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
      
      // Debug: Log the full variant object to see what we're working with
      console.log(`[getItemStock] Full variant object:`, JSON.stringify(variant, null, 2))
      
      // Check if quantity exists and is a valid number
      const stock = typeof variant.quantity === 'number' ? variant.quantity : (parseInt(String(variant.quantity || 0), 10) || 0)
      console.log(`[getItemStock] Variant ${variantIndex} (${variant.colorName}) of product ${productId}: ${stock} in stock (raw quantity: ${variant.quantity}, type: ${typeof variant.quantity})`)
      return stock
    }

    // Otherwise return the product's stock
    const stock = product.quantity ?? 0
    console.log(`[getItemStock] Product ${productId} (no variant): ${stock} in stock`)
    return stock
  } catch (error) {
    console.error(`[getItemStock] Error getting stock for itemId ${itemId}:`, error)
    return 0
  }
}

export async function updateProductStock(id: string, quantity: number): Promise<void> {
  await initFirestore()
  if (!firestoreModule || !db) {
    console.error("Firestore not initialized")
    throw new Error("Firestore not available")
  }

  try {
    const productRef = firestoreModule.doc(db, PRODUCTS_COLLECTION, id)
    const productDoc = await firestoreModule.getDoc(productRef)

    if (!productDoc.exists()) {
      console.warn(`Product ${id} not found for stock update`)
      throw new Error("Product not found")
    }

    await firestoreModule.updateDoc(productRef, { quantity })
    console.debug(`Product ${id} stock updated to ${quantity}`)
  } catch (error) {
    console.error("Error updating product stock:", error)
    throw error
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

// Update stock for a specific variant
export async function updateVariantStock(productId: string, variantIndex: number, quantity: number): Promise<void> {
  await initFirestore()
  if (!firestoreModule || !db) {
    console.error("Firestore not initialized")
    throw new Error("Firestore not available")
  }

  try {
    const productRef = firestoreModule.doc(db, PRODUCTS_COLLECTION, productId)
    const productDoc = await firestoreModule.getDoc(productRef)

    if (!productDoc.exists()) {
      console.warn(`Product ${productId} not found for variant stock update`)
      throw new Error("Product not found")
    }

    const productData = productDoc.data() as Product
    if (!productData.hasColorVariants || !productData.colorVariants || !productData.colorVariants[variantIndex]) {
      throw new Error(`Variant ${variantIndex} not found for product ${productId}`)
    }

    // Update the variant's quantity
    const updatedVariants = [...productData.colorVariants]
    updatedVariants[variantIndex] = {
      ...updatedVariants[variantIndex],
      quantity
    }

    // Update total quantity (sum of all variants)
    const totalQuantity = updatedVariants.reduce((sum, v) => sum + v.quantity, 0)

    await firestoreModule.updateDoc(productRef, {
      colorVariants: updatedVariants,
      quantity: totalQuantity
    })
    
    console.debug(`Product ${productId} variant ${variantIndex} stock updated to ${quantity}`)
  } catch (error) {
    console.error("Error updating variant stock:", error)
    throw error
  }
}

