import type { Product } from "@/lib/models"
import { getProducts } from "./product-service"

/**
 * Mapping of skin concerns to product search criteria
 * Each concern maps to subcategories and keywords to search for
 */
const SKIN_CONCERN_MAPPING: Record<
    string,
    {
        subcategories?: string[] // More specific subcategories
        keywords: string[] // Keywords to search in name, description, ingredients
        description: string
    }
> = {
    "Acné": {
        subcategories: ["visage"],
        keywords: [
            "acne", "acné", "blemish", "salicylic", "salicylique", "spot", "clear", 
            "BHA", "bouton", "imperfection", "purifiant", "anti-imperfection", 
            "tea tree", "arbre à thé", "niacinamide", "zinc", "benzoyl", "peroxide"
        ],
        description: "Éruptions actives détectées",

    },
    "Points noirs": {
        subcategories: ["visage"],
        keywords: [
            "blackhead", "points noirs", "BHA", "exfoliating", "exfoliant", 
            "pore", "pores", "charcoal", "charbon", "clay", "argile", 
            "salicylic", "salicylique", "comedone", "comédon", "purifiant"
        ],
        description: "Pores obstrués détectés",

    },
    "Taches brunes": {
        subcategories: ["visage"],
        keywords: [
            "brightening", "éclaircissant", "vitamin c", "vitamine c", 
            "niacinamide", "dark spot", "tache", "hyperpigmentation", 
            "even tone", "unifiant", "luminous", "lumineux", "radiance", 
            "éclat", "kojic", "alpha arbutin", "arbutin", "licorice", "réglisse"
        ],
        description: "Hyperpigmentation détectée",

    },
    "Peau sèche": {
        subcategories: ["visage"],
        keywords: [
            "hydrating", "hydratant", "hyaluronic", "hyaluronique", 
            "moisture", "moisturizer", "ceramide", "céramide", 
            "dry skin", "peau sèche", "nourishing", "nourrissant", 
            "squalane", "glycerin", "glycérine", "shea butter", 
            "beurre de karité", "intense hydration", "hydratation intense"
        ],
        description: "Peau déshydratée détectée",

    },
    "Pores dilatés": {
        subcategories: ["visage"],
        keywords: [
            "pore", "pores", "refining", "affinant", "minimizing", 
            "resserrant", "clay", "argile", "tightening", "mattifying", 
            "matifiant", "niacinamide", "BHA", "salicylic", "salicylique",
            "witch hazel", "hamamélis"
        ],
        description: "Pores élargis visibles détectés",

    },
    "Poches sous les yeux": {
        subcategories: ["visage"],
        keywords: [
            "eye cream", "contour des yeux", "contour yeux", 
            "caffeine", "caféine", "dark circle", "cernes", 
            "depuffing", "décongestionnant", "under eye", "poches", 
            "eye", "yeux", "peptide", "vitamin k", "vitamine k"
        ],
        description: "Gonflement sous les yeux détecté",

    },
    "Peau grasse": {
        subcategories: ["visage"],
        keywords: [
            "oil control", "contrôle sébum", "mattifying", "matifiant", 
            "sebum", "sébum", "balancing", "équilibrant", 
            "shine control", "oily", "grasse", "purifiant", 
            "oil-free", "sans huile", "niacinamide", "zinc", 
            "clay", "argile"
        ],
        description: "Production excessive de sébum détectée",

    },
    "Rougeurs cutanées": {
        subcategories: ["visage"],
        keywords: [
            "calming", "apaisant", "centella", "cica", "soothing", 
            "redness", "rougeur", "sensitive", "sensible", 
            "anti-redness", "anti-rougeur", "aloe", "aloé", 
            "chamomile", "camomille", "azulene", "bisabolol", 
            "madecassoside", "panthenol"
        ],
        description: "Rougeurs et irritation détectées",

    },
    "Points blancs": {
        subcategories: ["visage"],
        keywords: [
            "whitehead", "points blancs", "AHA", "glycolic", "glycolique",
            "lactic", "lactique", "exfoliating", "exfoliant", 
            "pore clarifying", "purifiant", "comedone", "comédon", 
            "gentle exfoliant", "exfoliant doux", "mandelic", "mandélique"
        ],
        description: "Comédons fermés détectés",

    },
    "Rides": {
        subcategories: ["visage"],
        keywords: [
            "retinol", "rétinol", "anti-aging", "anti-âge", 
            "peptide", "firming", "raffermissant", "wrinkle", "ride", 
            "collagen", "collagène", "anti-wrinkle", "anti-ride", 
            "bakuchiol", "vitamin a", "vitamine a", "lifting", 
            "matrixyl", "argireline"
        ],
        description: "Ridules et rides détectées",

    },
}

/**
 * Calculate relevance score for a product based on keywords
 * Searches in name, description, subcategory, and ingredients
 */
function calculateRelevanceScore(product: Product, keywords: string[]): number {
    let score = 0
    
    // Combine all searchable text
    const searchFields = {
        name: product.name.toLowerCase(),
        description: (product.description || "").toLowerCase(),
        subcategory: (product.subcategory || "").toLowerCase(),
        // Add ingredients if your product model has them
        // ingredients: (product.ingredients || "").toLowerCase(),
    }

    keywords.forEach((keyword) => {
        const keywordLower = keyword.toLowerCase()
        
        // Name matches are worth the most
        if (searchFields.name.includes(keywordLower)) {
            score += 5
        }
        
        // Subcategory matches are also valuable
        if (searchFields.subcategory.includes(keywordLower)) {
            score += 3
        }
        
        // Description matches are worth less
        if (searchFields.description.includes(keywordLower)) {
            score += 2
        }
        
        // If you have ingredients field, uncomment this:
        // if (searchFields.ingredients.includes(keywordLower)) {
        //     score += 4 // Ingredients are important!
        // }
    })

    // Boost score for featured products
    if (product.featured) {
        score += 3
    }

    // Boost score for highly rated products
    if (product.rating && product.rating >= 4.5) {
        score += 2
    } else if (product.rating && product.rating >= 4.0) {
        score += 1
    }

    return score
}

/**
 * Get products recommended for a specific skin concern
 * @param concernType - The type of skin concern (e.g., "Acné", "Peau sèche")
 * @param limit - Maximum number of products to return (default: 3)
 * @returns Array of products sorted by relevance
 */
export async function getProductsForSkinConcern(
    concernType: string,
    limit: number = 3
): Promise<Product[]> {
    const mapping = SKIN_CONCERN_MAPPING[concernType]

    if (!mapping) {
        console.warn(`No mapping found for skin concern: ${concernType}`)
        return []
    }

    try {
        // Fetch all products from Firebase
        const allProducts = await getProducts()

        // Filter and score products
        const scoredProducts = allProducts
            .filter((product) => {
                // Only consider skincare products (Soins category)
                if (!product.category.toLowerCase().includes('soins')) {
                    return false
                }
                
                // If subcategories are specified, check them
                if (mapping.subcategories && mapping.subcategories.length > 0) {
                    const hasMatchingSubcategory = mapping.subcategories.some(
                        (subcat) => (product.subcategory || "").toLowerCase().includes(subcat.toLowerCase())
                    )
                    
                    // If it doesn't match subcategory, still allow it if it has relevant keywords
                    if (!hasMatchingSubcategory) {
                        // Quick keyword check to see if it's worth scoring
                        const productText = `${product.name} ${product.description}`.toLowerCase()
                        const hasKeyword = mapping.keywords.some(kw => 
                            productText.includes(kw.toLowerCase())
                        )
                        if (!hasKeyword) {
                            return false
                        }
                    }
                }
                
                return true
            })
            .map((product) => ({
                product,
                score: calculateRelevanceScore(product, mapping.keywords),
            }))
        
        // Return top N products
        return scoredProducts.slice(0, limit).map((item) => item.product)
    } catch (error) {
        console.error(`Error fetching products for ${concernType}:`, error)
        return []
    }
}

/**
 * Get the description for a skin concern
 */
export function getSkinConcernDescription(concernType: string): string {
    return SKIN_CONCERN_MAPPING[concernType]?.description || "Skin concern detected"
}

/**
 * Get all supported skin concern types
 */
export function getSupportedSkinConcerns(): string[] {
    return Object.keys(SKIN_CONCERN_MAPPING)
}