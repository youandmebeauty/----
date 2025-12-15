import type { Product } from "@/lib/models"
import { getProducts } from "./product-service"

/**
 * Mapping of skin concerns to product search criteria
 * Each concern maps to subcategories, keywords, and incompatible ingredients
 */
const SKIN_CONCERN_MAPPING: Record<
    string,
    {
        subcategories?: string[]
        primaryKeywords: string[] // High-priority keywords (worth more points)
        secondaryKeywords: string[] // Supporting keywords
        exclusionKeywords?: string[] // Keywords that indicate product is NOT suitable
        incompatibleConcerns?: string[] // Other concerns that conflict with this one
        description: string
        severity: 'mild' | 'moderate' | 'severe' // Helps prioritize recommendations
    }
> = {
    "Acné": {
        subcategories: ["visage"],
        primaryKeywords: [
            "acne", "acné", "salicylic", "salicylique", "BHA", 
            "benzoyl peroxide", "anti-acne", "anti-imperfection"
        ],
        secondaryKeywords: [
            "blemish", "spot", "clear", "bouton", "imperfection", 
            "purifiant", "tea tree", "arbre à thé", "niacinamide", 
            "zinc", "antibacterial", "antibactérien"
        ],
        exclusionKeywords: ["comedogenic", "comédogène", "heavy oil", "huile lourde"],
        incompatibleConcerns: ["Peau sèche"],
        description: "Éruptions actives détectées",
        severity: 'moderate'
    },
    "Points noirs": {
        subcategories: ["visage"],
        primaryKeywords: [
            "blackhead", "points noirs", "BHA", "salicylic", 
            "salicylique", "pore clarifying", "exfoliating"
        ],
        secondaryKeywords: [
            "exfoliant", "pore", "pores", "charcoal", "charbon", 
            "clay", "argile", "comedone", "comédon", "purifiant",
            "retinol", "rétinol"
        ],
        description: "Pores obstrués détectés",
        severity: 'mild'
    },
    "Taches brunes": {
        subcategories: ["visage"],
        primaryKeywords: [
            "vitamin c", "vitamine c", "niacinamide", "dark spot",
            "hyperpigmentation", "brightening", "éclaircissant",
            "alpha arbutin", "arbutin", "kojic"
        ],
        secondaryKeywords: [
            "tache", "even tone", "unifiant", "luminous", "lumineux", 
            "radiance", "éclat", "licorice", "réglisse", "tranexamic",
            "azelaic", "azélaïque"
        ],
        description: "Hyperpigmentation détectée",
        severity: 'moderate'
    },
    "Peau sèche": {
        subcategories: ["visage"],
        primaryKeywords: [
            "hydrating", "hydratant", "hyaluronic", "hyaluronique",
            "ceramide", "céramide", "intense hydration", "hydratation intense"
        ],
        secondaryKeywords: [
            "moisture", "moisturizer", "dry skin", "peau sèche", 
            "nourishing", "nourrissant", "squalane", "glycerin", 
            "glycérine", "shea butter", "beurre de karité", "rich cream",
            "crème riche", "barrier repair", "réparation barrière"
        ],
        exclusionKeywords: ["mattifying", "matifiant", "oil control", "astringent"],
        incompatibleConcerns: ["Peau grasse"],
        description: "Peau déshydratée détectée",
        severity: 'moderate'
    },
    "Pores dilatés": {
        subcategories: ["visage"],
        primaryKeywords: [
            "pore minimizing", "pore refining", "affinant", 
            "niacinamide", "BHA", "pore tightening"
        ],
        secondaryKeywords: [
            "pore", "pores", "resserrant", "clay", "argile", 
            "mattifying", "matifiant", "salicylic", "salicylique",
            "witch hazel", "hamamélis", "retinol", "rétinol"
        ],
        description: "Pores élargis visibles détectés",
        severity: 'mild'
    },
    "Poches sous les yeux": {
        subcategories: ["visage"],
        primaryKeywords: [
            "eye cream", "contour des yeux", "contour yeux",
            "caffeine", "caféine", "depuffing", "décongestionnant"
        ],
        secondaryKeywords: [
            "dark circle", "cernes", "under eye", "poches",
            "eye", "yeux", "peptide", "vitamin k", "vitamine k",
            "cooling", "rafraîchissant"
        ],
        description: "Gonflement sous les yeux détecté",
        severity: 'mild'
    },
    "Peau grasse": {
        subcategories: ["visage"],
        primaryKeywords: [
            "oil control", "contrôle sébum", "mattifying", "matifiant",
            "sebum regulating", "oil-free", "sans huile"
        ],
        secondaryKeywords: [
            "sebum", "sébum", "balancing", "équilibrant",
            "shine control", "oily", "grasse", "purifiant",
            "niacinamide", "zinc", "clay", "argile", "lightweight",
            "léger"
        ],
        exclusionKeywords: ["heavy cream", "crème riche", "butter", "beurre"],
        incompatibleConcerns: ["Peau sèche"],
        description: "Production excessive de sébum détectée",
        severity: 'moderate'
    },
    "Rougeurs cutanées": {
        subcategories: ["visage"],
        primaryKeywords: [
            "calming", "apaisant", "centella", "cica", "soothing",
            "anti-redness", "anti-rougeur", "sensitive", "sensible"
        ],
        secondaryKeywords: [
            "redness", "rougeur", "aloe", "aloé", "chamomile", 
            "camomille", "azulene", "bisabolol", "madecassoside",
            "panthenol", "allantoin", "gentle", "doux"
        ],
        exclusionKeywords: ["fragrance", "parfum", "alcohol", "alcool", "exfoliating"],
        description: "Rougeurs et irritation détectées",
        severity: 'moderate'
    },
    "Points blancs": {
        subcategories: ["visage"],
        primaryKeywords: [
            "whitehead", "points blancs", "AHA", "glycolic", "glycolique",
            "exfoliating", "exfoliant"
        ],
        secondaryKeywords: [
            "lactic", "lactique", "pore clarifying", "purifiant",
            "comedone", "comédon", "gentle exfoliant", "exfoliant doux",
            "mandelic", "mandélique", "PHA"
        ],
        description: "Comédons fermés détectés",
        severity: 'mild'
    },
    "Rides": {
        subcategories: ["visage"],
        primaryKeywords: [
            "retinol", "rétinol", "anti-aging", "anti-âge",
            "peptide", "anti-wrinkle", "anti-ride", "collagen boost"
        ],
        secondaryKeywords: [
            "firming", "raffermissant", "wrinkle", "ride",
            "collagen", "collagène", "bakuchiol", "vitamin a",
            "vitamine a", "lifting", "matrixyl", "argireline",
            "elasticity", "élasticité"
        ],
        description: "Ridules et rides détectées",
        severity: 'moderate'
    },
}

/**
 * Calculate fuzzy match score between two strings
 * Uses Levenshtein-inspired algorithm
 */
function fuzzyMatch(str1: string, str2: string): number {
    const s1 = str1.toLowerCase()
    const s2 = str2.toLowerCase()
    
    // Exact match
    if (s1 === s2) return 1.0
    
    // Contains match
    if (s1.includes(s2) || s2.includes(s1)) return 0.8
    
    // Character overlap score
    const chars1 = new Set(s1.split(''))
    const chars2 = new Set(s2.split(''))
    const intersection = new Set([...chars1].filter(x => chars2.has(x)))
    const union = new Set([...chars1, ...chars2])
    
    return intersection.size / union.size
}

/**
 * Enhanced relevance score calculation with multiple factors
 */
function calculateRelevanceScore(
    product: Product, 
    primaryKeywords: string[],
    secondaryKeywords: string[],
    exclusionKeywords: string[] = []
): number {
    let score = 0
    
    // Combine all searchable text
    const searchFields = {
        name: product.name.toLowerCase(),
        description: (product.description || "").toLowerCase(),
        subcategory: (product.subcategory || "").toLowerCase(),
    }
    
    const allText = Object.values(searchFields).join(' ')
    
    // Check for exclusion keywords first (disqualifying factors)
    for (const keyword of exclusionKeywords) {
        if (allText.includes(keyword.toLowerCase())) {
            return -100 // Disqualify this product
        }
    }
    
    // Primary keywords (high value)
    primaryKeywords.forEach((keyword) => {
        const keywordLower = keyword.toLowerCase()
        
        // Name matches are extremely valuable
        if (searchFields.name.includes(keywordLower)) {
            score += 10
        } else if (fuzzyMatch(searchFields.name, keywordLower) > 0.7) {
            score += 7
        }
        
        // Subcategory matches
        if (searchFields.subcategory.includes(keywordLower)) {
            score += 6
        }
        
        // Description matches
        if (searchFields.description.includes(keywordLower)) {
            score += 4
        }
    })
    
    // Secondary keywords (moderate value)
    secondaryKeywords.forEach((keyword) => {
        const keywordLower = keyword.toLowerCase()
        
        if (searchFields.name.includes(keywordLower)) {
            score += 5
        }
        
        if (searchFields.subcategory.includes(keywordLower)) {
            score += 3
        }
        
        if (searchFields.description.includes(keywordLower)) {
            score += 2
        }
    })
    
    // Boost for featured products
    if (product.featured) {
        score += 5
    }
    
    // Penalty for very short descriptions (often less informative)
    if (searchFields.description.length < 50) {
        score -= 2
    }
    
    // Bonus for detailed descriptions
    if (searchFields.description.length > 200) {
        score += 2
    }
    
    return score
}

/**
 * Check if a product is suitable based on context
 */
function isProductSuitable(
    product: Product,
    concern: string,
    allDetectedConcerns: string[] = []
): boolean {
    const mapping = SKIN_CONCERN_MAPPING[concern]
    if (!mapping) return true
    
    // Check for incompatible concerns
    if (mapping.incompatibleConcerns && allDetectedConcerns.length > 0) {
        const hasIncompatible = mapping.incompatibleConcerns.some(
            incompatible => allDetectedConcerns.includes(incompatible)
        )
        if (hasIncompatible) {
            // Reduce effectiveness but don't exclude entirely
            return true // Let scoring handle this
        }
    }
    
    return true
}

/**
 * Get products recommended for a specific skin concern (Enhanced)
 * @param concernType - The type of skin concern
 * @param limit - Maximum number of products to return (default: 3)
 * @param allConcerns - All detected concerns for better context (optional)
 * @returns Array of products sorted by relevance
 */
export async function getProductsForSkinConcern(
    concernType: string,
    limit: number = 3,
    allConcerns: string[] = []
): Promise<Product[]> {
    const mapping = SKIN_CONCERN_MAPPING[concernType]

    if (!mapping) {
        console.warn(`No mapping found for skin concern: ${concernType}`)
        return []
    }

    try {
        const allProducts = await getProducts()

        // Filter and score products
        const scoredProducts = allProducts
            .filter((product) => {
                // Only skincare products
                if (!product.category.toLowerCase().includes('soins')) {
                    return false
                }
                
                // Check suitability based on all concerns
                if (!isProductSuitable(product, concernType, allConcerns)) {
                    return false
                }
                
                // Subcategory filtering
                if (mapping.subcategories && mapping.subcategories.length > 0) {
                    const hasMatchingSubcategory = mapping.subcategories.some(
                        (subcat) => (product.subcategory || "").toLowerCase().includes(subcat.toLowerCase())
                    )
                    
                    if (!hasMatchingSubcategory) {
                        // Allow if has strong keyword match
                        const productText = `${product.name} ${product.description}`.toLowerCase()
                        const hasStrongKeyword = mapping.primaryKeywords.some(kw => 
                            productText.includes(kw.toLowerCase())
                        )
                        if (!hasStrongKeyword) {
                            return false
                        }
                    }
                }
                
                return true
            })
            .map((product) => ({
                product,
                score: calculateRelevanceScore(
                    product, 
                    mapping.primaryKeywords,
                    mapping.secondaryKeywords,
                    mapping.exclusionKeywords
                ),
            }))
            .filter(item => item.score > 0) // Remove disqualified products
            .sort((a, b) => b.score - a.score) // Sort by score descending
        
        return scoredProducts.slice(0, limit).map((item) => item.product)
    } catch (error) {
        console.error(`Error fetching products for ${concernType}:`, error)
        return []
    }
}

/**
 * Get products for multiple skin concerns with intelligent deduplication
 * Returns best products that address multiple concerns when possible
 */
export async function getProductsForMultipleConcerns(
    concerns: string[],
    limit: number = 5
): Promise<{ product: Product; addresses: string[]; score: number }[]> {
    if (concerns.length === 0) return []
    
    try {
        const allProducts = await getProducts()
        const productScores = new Map<string, { product: Product; concerns: Set<string>; totalScore: number }>()
        
        // Score each product against all concerns
        for (const concern of concerns) {
            const mapping = SKIN_CONCERN_MAPPING[concern]
            if (!mapping) continue
            
            allProducts
                .filter(p => p.category.toLowerCase().includes('soins'))
                .forEach(product => {
                    const score = calculateRelevanceScore(
                        product,
                        mapping.primaryKeywords,
                        mapping.secondaryKeywords,
                        mapping.exclusionKeywords
                    )
                    
                    if (score > 5) { // Threshold for relevance
                        const key = product.id || product.name
                        const existing = productScores.get(key)
                        
                        if (existing) {
                            existing.concerns.add(concern)
                            existing.totalScore += score
                        } else {
                            productScores.set(key, {
                                product,
                                concerns: new Set([concern]),
                                totalScore: score
                            })
                        }
                    }
                })
        }
        
        // Convert to array and sort
        const results = Array.from(productScores.values())
            .map(item => ({
                product: item.product,
                addresses: Array.from(item.concerns),
                score: item.totalScore * (1 + item.concerns.size * 0.3) // Bonus for multi-concern products
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, limit)
        
        return results
    } catch (error) {
        console.error('Error fetching products for multiple concerns:', error)
        return []
    }
}

/**
 * Get the description for a skin concern
 */
export function getSkinConcernDescription(concernType: string): string {
    return SKIN_CONCERN_MAPPING[concernType]?.description || "Problème cutané détecté"
}

/**
 * Get severity level for a concern
 */
export function getSkinConcernSeverity(concernType: string): 'mild' | 'moderate' | 'severe' | undefined {
    return SKIN_CONCERN_MAPPING[concernType]?.severity
}

/**
 * Get all supported skin concern types
 */
export function getSupportedSkinConcerns(): string[] {
    return Object.keys(SKIN_CONCERN_MAPPING)
}

/**
 * Check if two concerns are compatible
 */
export function areConcernsCompatible(concern1: string, concern2: string): boolean {
    const mapping1 = SKIN_CONCERN_MAPPING[concern1]
    const mapping2 = SKIN_CONCERN_MAPPING[concern2]
    
    if (!mapping1 || !mapping2) return true
    
    const incompatible1 = mapping1.incompatibleConcerns || []
    const incompatible2 = mapping2.incompatibleConcerns || []
    
    return !incompatible1.includes(concern2) && !incompatible2.includes(concern1)
}