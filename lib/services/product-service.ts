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

    return {
      id: productDoc.id,
      ...productDoc.data(),
    } as Product
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
  subcategory?: string,
  limitCount = 4
): Promise<Product[]> {
  // Server-side: Use Firebase Admin SDK
  if (typeof window === "undefined") {
    try {
      const { adminDb } = await import("@/lib/firebase-admin")
      let query = adminDb.collection(PRODUCTS_COLLECTION).where("category", "==", category)

      if (subcategory) {
        query = query.where("subcategory", "==", subcategory)
      }

      const snapshot = await query.orderBy("createdAt", "desc").limit(limitCount + 5).get()

      // Filter out current product and serialize
      const products = snapshot.docs
        .filter((doc) => doc.id !== productId)
        .slice(0, limitCount)
        .map((doc) => {
          const data = doc.data()
          return JSON.parse(JSON.stringify({
            id: doc.id,
            ...data,
          }))
        }) as Product[]

      return products
    } catch (error) {
      console.error("Error fetching related products (server):", error)
      return []
    }
  }

  // Client-side: Use Firebase Client SDK
  await initFirestore()
  if (!firestoreModule || !db) return []

  try {
    const productsRef = firestoreModule.collection(db, PRODUCTS_COLLECTION)
    const constraints: any[] = [
      firestoreModule.where("category", "==", category),
    ]

    if (subcategory) {
      constraints.push(firestoreModule.where("subcategory", "==", subcategory))
    }

    constraints.push(firestoreModule.orderBy("createdAt", "desc"))
    constraints.push(firestoreModule.limit(limitCount + 5))

    const q = firestoreModule.query(productsRef, ...constraints)
    const snapshot = await firestoreModule.getDocs(q)

    // Filter out current product and limit results
    return snapshot.docs
      .map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
      }) as Product)
      .filter((product: Product) => product.id !== productId)
      .slice(0, limitCount)
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
          product.description.toLowerCase().includes(lowerSearchTerm),
      )
    }

    return products
  } catch (error) {
    console.error("Error searching products:", error)
    return []
  }
}

export async function createProduct(product: Omit<Product, "id" | "createdAt" | "updatedAt">): Promise<Product> {
  await initFirestore()
  if (!firestoreModule || !db) throw new Error("Firestore not available")

  try {
    const productData = {
      ...product,
      createdAt: firestoreModule.serverTimestamp(),
      updatedAt: firestoreModule.serverTimestamp(),
    }

    const docRef = await firestoreModule.addDoc(firestoreModule.collection(db, PRODUCTS_COLLECTION), productData)

    return {
      id: docRef.id,
      ...productData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Product
  } catch (error) {
    console.error("Error creating product:", error)
    throw error
  }
}

export async function updateProduct(
  id: string,
  product: Partial<Omit<Product, "id" | "createdAt" | "updatedAt">>,
): Promise<Product> {
  await initFirestore()
  if (!firestoreModule || !db) throw new Error("Firestore not available")

  try {
    const productRef = firestoreModule.doc(db, PRODUCTS_COLLECTION, id)
    const productDoc = await firestoreModule.getDoc(productRef)

    if (!productDoc.exists()) {
      throw new Error("Product not found")
    }

    const productData = {
      ...product,
      updatedAt: firestoreModule.serverTimestamp(),
    }

    await firestoreModule.updateDoc(productRef, productData)

    return {
      id,
      ...productDoc.data(),
      ...productData,
      updatedAt: new Date().toISOString(),
    } as Product
  } catch (error) {
    console.error("Error updating product:", error)
    throw error
  }
}

export async function deleteProduct(id: string): Promise<void> {
  await initFirestore()
  if (!firestoreModule || !db) throw new Error("Firestore not available")

  try {
    const productRef = firestoreModule.doc(db, PRODUCTS_COLLECTION, id)
    const productDoc = await firestoreModule.getDoc(productRef)

    if (!productDoc.exists()) {
      throw new Error("Product not found")
    }

    await firestoreModule.deleteDoc(productRef)
  } catch (error) {
    console.error("Error deleting product:", error)
    throw error
  }
}

export async function updateProductStock(id: string, stock: number): Promise<void> {
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

    await firestoreModule.updateDoc(productRef, { stock })
    console.debug(`Product ${id} stock updated to ${stock}`)
  } catch (error) {
    console.error("Error updating product stock:", error)
    throw error
  }
}

