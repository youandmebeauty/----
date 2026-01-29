export interface ColorVariant {
  colorName: string
  color?: string // Hex color code (optional for backward compatibility)
  image: string
  quantity: number
  barcode: string
}

export interface Product {
  id: string
  name: string
  barcode?: string
  brand: string
  price: number
  image?: string // Kept for backward compatibility, will use first image from images array
  images?: string[] // Array of product images
  category: string
  subcategory?: string
  skinType?: string[]
  hairType?: string[]
  targetAudience?: string[]
  productType?: string
  description: string
  longDescription?: string
  howToUse?: string
  ingredients: string[]
  perfumeNotes: {
    top?: string[] // Notes de tête
    heart?: string[] // Notes de cœur
    base?: string[] // Notes de fond
  }
  quantity: number
  featured?: boolean
  hasColorVariants?: boolean
  colorVariants?: ColorVariant[]
  createdAt: Date | string| number

  updatedAt: Date | string| number

}

export interface Order {
  id: string
  customerName: string
  email: string
  phone?: string
  address: string
  city: string
  postalCode: string
  gouvernorat: string
  items: OrderItem[]
  total: number
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  notes?: string
  promoCode?: string
  discount?: number
  createdAt: Date | string
}

export interface PromoCode {
  id: string
  code: string
  type: 'percentage' | 'fixed'
  value: number
  minPurchase?: number
  expiryDate?: Date | string
  description?: string
  active?: boolean
  usageLimit?: number
  usedCount?: number
  createdAt?: Date | string
  updatedAt?: Date | string
}

export interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
}

export interface SearchFilters {
  category?: string
  subcategory?: string
  skinType?: string[]
  hairType?: string[]
  minPrice?: number
  maxPrice?: number
  brand?: string[]
  ingredients?: string[]
  sortBy?: "price-asc" | "price-desc" | "featured" |   "newest"
}

// Extended Coffret model with all possible fields
export interface Coffret {
  id: string
  name: string
  description?: string
  price: number
  originalPrice?: number // For showing discounts
  images: string[]
  productIds: string[]
  stock?: number
  featured?: boolean
  createdAt: string | Date
  updatedAt: string | Date
  category?: string
  tags?: string[]
  metadata?: Record<string, any>
}



// Service response types
export interface ServiceResponse<T> {
  data: T | null
  error: string | null
  loading: boolean
}

// Cache entry interface
export interface CacheEntry<T> {
  data: T
  timestamp: number
}

// Firestore module interface
export interface FirestoreModule {
  collection: any
  getDocs: any
  getDoc: any
  addDoc: any
  updateDoc: any
  deleteDoc: any
  doc: any
  query: any
  orderBy: any
  serverTimestamp: any
  Timestamp?: any
}