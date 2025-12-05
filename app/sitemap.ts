import { MetadataRoute } from 'next'
import { getProducts } from '@/lib/services/product-service'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://youandme.tn'

    // Static routes
    const routes = [
        '',
        '/shop',
        '/skin-analyzer',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1,
    }))

    // Dynamic product routes
    const products = await getProducts()
    const productRoutes = products.map((product) => ({
        url: `${baseUrl}/product/${product.id}`,
        lastModified: new Date(product.updatedAt || new Date()),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }))

    return [...routes, ...productRoutes]
}
