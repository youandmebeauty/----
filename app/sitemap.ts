import { MetadataRoute } from 'next'
import { getProducts } from '@/lib/services/product-service'
import { generateSlug } from '@/lib/product-url'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://youandme.tn'

    // Static routes
    const routes = [
        '',
        '/shop',
        '/skin-analyzer',
        '/contact',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1,
    }))

    // Dynamic product routes with slugs
    const products = await getProducts()
    const productRoutes = products.map((product) => {
        const slug = generateSlug(product.name, {
            includeBrand: product.brand // Optional: include for better SEO
        })
        
        return {
            url: `${baseUrl}/product/${slug}?id=${product.id}`,
            lastModified: new Date(product.updatedAt || new Date()),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        }
    })

    return [...routes, ...productRoutes]
}