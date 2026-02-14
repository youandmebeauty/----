import "server-only"
import { type NextRequest, NextResponse } from "next/server"
import { verifyAdminToken } from "@/lib/utils/auth-utils"
import { getProducts } from "@/lib/services/product-service"
import { getCoffrets } from "@/lib/services/coffret-service"
import { generateSlug } from "@/lib/urls/product-url"
import {
  notifyUrlChange,
  type IndexingResult,
} from "@/lib/services/google-indexing-service"

const BASE_URL = "https://youandme.tn"

const STATIC_ROUTES = [
  "/",
  "/shop",
  "/coffrets",
  "/skin-analyzer",
  "/contact",
  "/legal",
]

/**
 * POST /api/google-indexing/bulk
 *
 * Submits ALL site URLs (static + every product + every coffret) to the
 * Google Indexing API so Google crawls and indexes them immediately.
 *
 * ⚠ Default quota is 200 publish requests / day.
 *    You can request a higher quota in Google Cloud Console.
 *
 * Optional body:
 *   { "type": "products" }   → only products
 *   { "type": "coffrets" }   → only coffrets
 *   { "type": "static" }     → only static pages
 *   (no body or {})          → everything
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAdminToken(request)
    if (!auth.valid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let filter: string | undefined
    try {
      const body = await request.json()
      filter = body?.type
    } catch {
      // empty body → submit everything
    }

    const urls: string[] = []

    // ── Static pages ──
    if (!filter || filter === "static") {
      for (const route of STATIC_ROUTES) {
        urls.push(`${BASE_URL}${route}`)
      }
    }

    // ── Product pages ──
    if (!filter || filter === "products") {
      try {
        const products = await getProducts()
        for (const product of products) {
          const slug = generateSlug(product.name, {
            includeBrand: product.brand,
          })
          urls.push(`${BASE_URL}/product/${product.id}-${slug}`)
        }
      } catch (err) {
        console.error("[google-indexing/bulk] Failed to fetch products:", err)
      }
    }

    // ── Coffret pages ──
    if (!filter || filter === "coffrets") {
      try {
        const coffrets = await getCoffrets()
        for (const coffret of coffrets) {
          const slug = generateSlug(coffret.name)
          urls.push(`${BASE_URL}/coffrets/${coffret.id}-${slug}`)
        }
      } catch (err) {
        console.error("[google-indexing/bulk] Failed to fetch coffrets:", err)
      }
    }

    if (urls.length === 0) {
      return NextResponse.json({ message: "No URLs to submit" }, { status: 200 })
    }

    // Submit all URLs sequentially (API has no batch endpoint)
    const results: IndexingResult[] = []
    let succeeded = 0
    let failed = 0

    for (const url of urls) {
      const result = await notifyUrlChange(url, "URL_UPDATED")
      results.push(result)
      if (result.success) succeeded++
      else failed++
    }

    return NextResponse.json({
      total: urls.length,
      succeeded,
      failed,
      results,
    })
  } catch (error) {
    console.error("[google-indexing/bulk] Error:", error)
    return NextResponse.json(
      { error: "Failed to submit bulk indexing requests" },
      { status: 500 },
    )
  }
}
