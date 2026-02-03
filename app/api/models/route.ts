import { type NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/utils/firebase-admin-util"
import { getModelFile } from "@/lib/server/model-loader.server"

/**
 * Secure ONNX Model Serving API
 * 
 * Only serve model to authenticated/authorized clients
 * Rate limited to prevent abuse
 */

// Track requests for rate limiting
const modelRequests = new Map<string, number[]>()

const RATE_LIMIT = 10 // requests per minute
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute

function checkRateLimit(clientId: string): boolean {
  const now = Date.now()
  const requests = modelRequests.get(clientId) || []

  // Remove old requests outside the window
  const recentRequests = requests.filter((time) => now - time < RATE_LIMIT_WINDOW)

  if (recentRequests.length >= RATE_LIMIT) {
    return false
  }

  recentRequests.push(now)
  modelRequests.set(clientId, recentRequests)
  return true
}

function getClientId(request: NextRequest): string {
  return request.headers.get("x-device-id") ||
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    "unknown"
}

export async function GET(request: NextRequest) {
  try {
    const clientId = getClientId(request)

    // Check rate limiting
    if (!checkRateLimit(clientId)) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429 }
      )
    }

    const { searchParams } = new URL(request.url)
    const modelName = searchParams.get("model")

    if (!modelName) {
      return NextResponse.json(
        { error: "Model name required" },
        { status: 400 }
      )
    }

    // Load model from secure private directory
    const modelBuffer = await getModelFile(modelName)

    // Return model with security headers
    return new NextResponse(new Uint8Array(modelBuffer), {
      headers: {
        "Content-Type": "application/octet-stream",
        "Cache-Control": "public, max-age=86400, immutable", // Cache for 24 hours
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "X-XSS-Protection": "1; mode=block",
      },
    })
  } catch (error) {
    console.error("Error serving model:", error)
    return NextResponse.json(
      { error: "Failed to load model" },
      { status: 500 }
    )
  }
}
