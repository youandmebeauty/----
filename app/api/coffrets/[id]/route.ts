import { NextRequest, NextResponse } from "next/server"
import { revalidateTag } from "next/cache"
import type { Coffret } from "@/lib/models/models"

const COFFRETS_COLLECTION = "coffrets"

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> } // ✅ params is now a Promise
) {
    try {
        const { id } = await params // ✅ await params
        const updates: Partial<Omit<Coffret, "id" | "createdAt">> = await request.json()

        if (!id) {
            return NextResponse.json(
                { error: "Coffret ID is required" },
                { status: 400 }
            )
        }

        // Validate updates
        if (updates.price !== undefined && updates.price < 0) {
            return NextResponse.json(
                { error: "Price cannot be negative" },
                { status: 400 }
            )
        }
        if (updates.productIds !== undefined && (!Array.isArray(updates.productIds) || updates.productIds.length === 0)) {
            return NextResponse.json(
                { error: "At least one product is required" },
                { status: 400 }
            )
        }

        const { adminDb } = await import("@/lib/utils/firebase-admin-util")

        // Remove undefined values
        const cleanUpdates = Object.fromEntries(
            Object.entries(updates).filter(([_, v]) => v !== undefined)
        )

        // If productIds are being updated, recompute originalPrice and quantity
        if (updates.productIds !== undefined) {
            try {
                const { getProductById } = await import("@/lib/services/product-service")
                const proms = (updates.productIds || []).map((pid: string) => getProductById(pid))
                const products = await Promise.all(proms)
                const originalPrice = products.reduce((sum, p) => sum + (p?.price ?? 0), 0)
                ;(cleanUpdates as any).originalPrice = originalPrice

                // Compute quantity as minimum stock among selected products
                const stocks = products.map(p => p?.quantity ?? 0)
                const computedQuantity = stocks.length > 0 ? Math.min(...stocks) : 0
                ;(cleanUpdates as any).quantity = computedQuantity
            } catch (err) {
                console.error("Failed computing originalPrice/quantity during updateCoffret:", err)
            }
        }

        await adminDb.collection(COFFRETS_COLLECTION).doc(id).update({
            ...cleanUpdates,
            updatedAt: new Date()
        })

        // Fetch the updated document
        const docSnap = await adminDb.collection(COFFRETS_COLLECTION).doc(id).get()
        if (!docSnap.exists) {
            return NextResponse.json(
                { error: "Coffret not found after update" },
                { status: 404 }
            )
        }

        const updatedCoffret = JSON.parse(
            JSON.stringify({
                id: docSnap.id,
                ...docSnap.data()
            })
        ) as Coffret

        // Revalidate the coffrets cache
        revalidateTag("coffrets","default")

        return NextResponse.json(updatedCoffret)
    } catch (error) {
        console.error("Error updating coffret:", error)
        return NextResponse.json(
            { error: "Failed to update coffret" },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> } // ✅ params is now a Promise
) {
    try {
        const { id } = await params // ✅ await params

        if (!id) {
            return NextResponse.json(
                { error: "Coffret ID is required" },
                { status: 400 }
            )
        }

        const { adminDb } = await import("@/lib/utils/firebase-admin-util")

        await adminDb.collection(COFFRETS_COLLECTION).doc(id).delete()

        // Revalidate the coffrets cache
        revalidateTag("coffrets","default")

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error deleting coffret:", error)
        return NextResponse.json(
            { error: "Failed to delete coffret" },
            { status: 500 }
        )
    }
}