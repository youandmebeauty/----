export interface Product {
  id: string
  name: string
  brand: string
  price: number
  image: string
  category: string
  subcategory?: string
  skinType?: string[]
  hairType?: string[]
  targetAudience?: string[]
  productType?: string
  description: string
  longDescription?: string
  ingredients?: string[]
  quantity: number
  featured?: boolean
  createdAt: Date | string
  updatedAt: Date | string
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
  sortBy?: "price-asc" | "price-desc" | "name-asc" | "name-desc" | "newest"
}
