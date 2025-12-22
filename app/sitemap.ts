import { MetadataRoute } from "next"
import { getProducts } from "@/lib/services/product-service"
import { generateSlug } from "@/lib/product-url"

// Ensure this runs at request time so missing env vars or admin SDK
// issues during build don't break the entire build.
export const dynamic = "force-dynamic"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = "https://youandme.tn"

    // Static routes
    const routes = ["", "/shop", "/skin-analyzer", "/contact"].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 1,
    }))

    // Dynamic product routes with slugs
    let products = [] as Awaited<ReturnType<typeof getProducts>>

    try {
        products = await getProducts()
    } catch (error) {
        console.error("Error loading products for sitemap:", error)
        // Fail gracefully: return only the static routes
        return routes
    }

    const productRoutes = products.map((product) => {
        const slug = generateSlug(product.name, {
            includeBrand: product.brand,
        })

        const rawUpdatedAt: any = (product as any).updatedAt
        let lastModified: Date

        if (rawUpdatedAt && typeof rawUpdatedAt.toDate === "function") {
            // Firestore Timestamp
            lastModified = rawUpdatedAt.toDate()
        } else if (rawUpdatedAt) {
            const parsed = new Date(rawUpdatedAt)
            lastModified = isNaN(parsed.getTime()) ? new Date() : parsed
        } else {
            lastModified = new Date()
        }

        return {
            url: `${baseUrl}/product/${slug}?id=${product.id}`,
            lastModified,
            changeFrequency: "weekly" as const,
            priority: 0.8,
        }
    })

    return [...routes, ...productRoutes]
}