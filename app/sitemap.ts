import { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = "https://youandme.tn"

    // Static routes only - products discoverable via /shop page
    const routes = ["", "/shop", "/skin-analyzer", "/contact"].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 1,
    }))

    return routes
}