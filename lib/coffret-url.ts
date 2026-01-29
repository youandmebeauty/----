import { generateSlug } from "@/lib/product-url"
import type { Coffret } from "@/lib/models"

/**
 * Generate a full coffret URL with Slug and ID
 * Format: /coffrets/coffret-name-123abc
 * 
 * @param coffret - The coffret object
 * @returns The full URL path for the coffret
 */
export function getCoffretUrl(coffret: Coffret): string {
  const Slug = generateSlug(coffret.name)
  return `/coffrets/${coffret.id}-${Slug}`
}
  

/**
 * Generate just the Slug from a coffret name
 * 
 * @param name - The coffret name
 * @returns The Slug
 */
export function getCoffretSlug(name: string): string {
  return generateSlug(name)
}

/**
 * Parse a coffret URL to extract ID and Slug
 * Handles multiple formats:
 * - /coffrets/name-123abc (Slug with ID)
 * - /coffrets/name?id=123abc (Slug with search param)
 * 
 * @param url - The URL or path
 * @returns Object with Slug and id
 */
export function parseCoffretUrl(url: string): {
  Slug: string | null
  id: string | null
} {
  try {
    const urlObj = new URL(url, 'http://dummy.com')
    const pathParts = urlObj.pathname.split('/').filter(Boolean)
    
    if (pathParts[0] !== 'coffrets' || !pathParts[1]) {
      return { Slug: null, id: null }
    }
    
    const SlugPart = pathParts[1]
    
    // Check for ID in search params
    const idParam = urlObj.searchParams.get('id')
    if (idParam) {
      return { Slug: SlugPart, id: idParam }
    }
    
    // Check for ID in Slug (last part after last hyphen)
    const parts = SlugPart.split('-')
    const lastPart = parts[parts.length - 1]
    
    if (lastPart && lastPart.length >= 15 && /^[a-zA-Z0-9]+$/.test(lastPart)) {
      return {
        Slug: parts.slice(0, -1).join('-'),
        id: lastPart
      }
    }
    
    return { Slug: SlugPart, id: null }
  } catch {
    return { Slug: null, id: null }
  }
}

/**
 * Validate if a string looks like a Firebase document ID
 * 
 * @param str - The string to validate
 * @returns True if it looks like a Firebase ID
 */
export function isFirebaseId(str: string): boolean {
  return str.length >= 15 && /^[a-zA-Z0-9]+$/.test(str)
}

/**
 * Generate canonical URL for a coffret (for SEO)
 * 
 * @param coffret - The coffret object
 * @param baseUrl - The base URL of the site (e.g., 'https://example.com')
 * @returns The full canonical URL
 */
export function getCoffretCanonicalUrl(coffret: Coffret, baseUrl: string): string {
  const path = getCoffretUrl(coffret)
  return `${baseUrl}${path}`
}

/**
 * Generate Open Graph image URL for a coffret
 * 
 * @param coffret - The coffret object
 * @returns The OG image URL or null
 */
export function getCoffretOgImage(coffret: Coffret): string | null {
  return coffret.images?.[0] || null
}

/**
 * Generate structured data (JSON-LD) for a coffret product
 * For SEO and rich snippets
 * 
 * @param coffret - The coffret object
 * @param baseUrl - The base URL of the site
 * @returns JSON-LD structured data object
 */
export function getCoffretStructuredData(coffret: Coffret, baseUrl: string) {
  const url = getCoffretCanonicalUrl(coffret, baseUrl)
  const image = getCoffretOgImage(coffret)
  
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": coffret.name,
    "description": coffret.description,
    "image": image ? `${baseUrl}${image}` : undefined,
    "url": url,
    "offers": {
      "@type": "Offer",
      "price": coffret.price.toFixed(2),
      "priceCurrency": "TND",
      "availability": coffret.stock === 0 
        ? "https://schema.org/OutOfStock" 
        : "https://schema.org/InStock",
      "url": url,
      "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },

  }
}