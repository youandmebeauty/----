import { NextRequest, NextResponse } from "next/server"
import { revalidateProducts } from "@/lib/revalidate"

// Protected on-demand revalidation endpoint.
// Expects header `x-revalidate-secret` to match `process.env.REVALIDATE_SECRET`.

export async function POST(request: NextRequest) {
  try {
    const secretHeader = request.headers.get("x-revalidate-secret")
    const secretEnv = process.env.REVALIDATE_SECRET

    if (!secretEnv || secretHeader !== secretEnv) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const action = body?.action || "external-update"
    const meta = body?.meta || {}

    await revalidateProducts(action, meta)

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("Error in revalidate-products endpoint:", e)
    return NextResponse.json({ error: "Failed to revalidate" }, { status: 500 })
  }
}
