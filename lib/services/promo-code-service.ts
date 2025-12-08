import type { PromoCode } from "@/lib/models"

const API_BASE = "/api/promo-codes"

export async function getPromoCodes(): Promise<PromoCode[]> {
  try {
    const response = await fetch(API_BASE)
    if (!response.ok) {
      throw new Error("Failed to fetch promo codes")
    }
    return await response.json()
  } catch (error) {
    console.error("Error fetching promo codes:", error)
    return []
  }
}

export async function getPromoCodeById(id: string): Promise<PromoCode | null> {
  try {
    const response = await fetch(`${API_BASE}/${id}`)
    if (!response.ok) {
      if (response.status === 404) return null
      throw new Error("Failed to fetch promo code")
    }
    return await response.json()
  } catch (error) {
    console.error("Error getting promo code:", error)
    return null
  }
}

export async function getPromoCodeByCode(code: string): Promise<PromoCode | null> {
  try {
    const response = await fetch(`${API_BASE}/validate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code }),
    })

    if (!response.ok) {
      if (response.status === 404) return null
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to validate promo code")
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching promo code by code:", error)
    return null
  }
}

export async function createPromoCode(promoCode: Omit<PromoCode, "id" | "createdAt" | "updatedAt" | "usedCount">): Promise<PromoCode> {
  try {
    const response = await fetch(API_BASE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code: promoCode.code,
        type: promoCode.type,
        value: promoCode.value,
        minPurchase: promoCode.minPurchase,
        expiryDate: promoCode.expiryDate
          ? typeof promoCode.expiryDate === "string"
            ? promoCode.expiryDate
            : promoCode.expiryDate.toISOString()
          : undefined,
        description: promoCode.description,
        active: promoCode.active !== undefined ? promoCode.active : true,
        usageLimit: promoCode.usageLimit,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to create promo code")
    }

    return await response.json()
  } catch (error) {
    console.error("Error creating promo code:", error)
    throw error
  }
}

export async function updatePromoCode(
  id: string,
  promoCode: Partial<Omit<PromoCode, "id" | "createdAt" | "updatedAt">>
): Promise<PromoCode> {
  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code: promoCode.code,
        type: promoCode.type,
        value: promoCode.value,
        minPurchase: promoCode.minPurchase,
        expiryDate: promoCode.expiryDate
          ? typeof promoCode.expiryDate === "string"
            ? promoCode.expiryDate
            : promoCode.expiryDate.toISOString()
          : undefined,
        description: promoCode.description,
        active: promoCode.active,
        usageLimit: promoCode.usageLimit,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to update promo code")
    }

    return await response.json()
  } catch (error) {
    console.error("Error updating promo code:", error)
    throw error
  }
}

export async function deletePromoCode(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to delete promo code")
    }
  } catch (error) {
    console.error("Error deleting promo code:", error)
    throw error
  }
}

export async function incrementPromoCodeUsage(code: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/increment-usage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to increment promo code usage")
    }
  } catch (error) {
    console.error("Error incrementing promo code usage:", error)
    throw error
  }
}

