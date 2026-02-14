import "server-only"
import { type NextRequest, NextResponse } from "next/server"
import { verifyAdminToken } from "@/lib/utils/auth-utils"
import {
  notifyUrlChange,
  notifyUrlChanges,
  getUrlStatus,
} from "@/lib/services/google-indexing-service"

/**
 * POST /api/google-indexing
 *
 * Body (single URL):
 *   { "url": "https://youandme.tn/product/xxx-slug", "action": "URL_UPDATED" }
 *
 * Body (batch):
 *   { "urls": ["https://…", "https://…"], "action": "URL_UPDATED" }
 *
 * GET /api/google-indexing?url=https://youandme.tn/product/xxx-slug
 *   → returns last notification metadata for that URL
 */

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAdminToken(request)
    if (!auth.valid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const action = body.action ?? "URL_UPDATED"

    if (body.urls && Array.isArray(body.urls)) {
      const results = await notifyUrlChanges(body.urls, action)
      return NextResponse.json({ results })
    }

    if (body.url) {
      const result = await notifyUrlChange(body.url, action)
      return NextResponse.json(result)
    }

    return NextResponse.json(
      { error: "Provide 'url' or 'urls' in request body" },
      { status: 400 },
    )
  } catch (error) {
    console.error("[google-indexing] API error:", error)
    return NextResponse.json(
      { error: "Failed to notify Google Indexing API" },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAdminToken(request)
    if (!auth.valid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const url = request.nextUrl.searchParams.get("url")
    if (!url) {
      return NextResponse.json(
        { error: "Provide 'url' query parameter" },
        { status: 400 },
      )
    }

    const result = await getUrlStatus(url)
    return NextResponse.json(result)
  } catch (error) {
    console.error("[google-indexing] API error:", error)
    return NextResponse.json(
      { error: "Failed to fetch indexing status" },
      { status: 500 },
    )
  }
}
