import type { CartItem } from "@/components/cart-provider"

export function validateCartItem(item: any): item is CartItem {
  return (
    item &&
    typeof item === "object" &&
    typeof item.id === "string" &&
    typeof item.name === "string" &&
    typeof item.price === "number" &&
    typeof item.image === "string" &&
    typeof item.category === "string" &&
    typeof item.quantity === "number" &&
    item.quantity > 0 &&
    item.price >= 0
  )
}

export function sanitizeCartItems(items: any[]): CartItem[] {
  if (!Array.isArray(items)) {
    return []
  }

  return items.filter(validateCartItem).map((item) => ({
    ...item,
    quantity: Math.max(1, Math.floor(item.quantity)), // Ensure quantity is at least 1 and is an integer
    price: Math.max(0, item.price), // Ensure price is not negative
  }))
}

export function getCartStorageKey(): string {
  return "cart-items"
}

export function saveCartToStorage(items: CartItem[]): boolean {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem(getCartStorageKey(), JSON.stringify(items))
      return true
    }
    return false
  } catch (error) {
    console.error("Error saving cart to localStorage:", error)
    return false
  }
}

export function loadCartFromStorage(): CartItem[] {
  try {
    if (typeof window !== "undefined") {
      const savedCart = localStorage.getItem(getCartStorageKey())
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart)
        return sanitizeCartItems(parsedCart)
      }
    }
    return []
  } catch (error) {
    console.error("Error loading cart from localStorage:", error)
    // Clear corrupted data
    if (typeof window !== "undefined") {
      localStorage.removeItem(getCartStorageKey())
    }
    return []
  }
}

export function clearCartStorage(): void {
  try {
    if (typeof window !== "undefined") {
      localStorage.removeItem(getCartStorageKey())
    }
  } catch (error) {
    console.error("Error clearing cart from localStorage:", error)
  }
}
