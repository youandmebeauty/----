import { NextRequest, NextResponse } from "next/server"
import { revalidateTag } from "next/cache"
import type { Coffret } from "@/lib/models/models"
import { Timestamp } from "firebase-admin/firestore"

const COFFRETS_COLLECTION = "coffrets"

export async function POST(request: NextRequest) {
    try {
        const coffret: Omit<Coffret, "id" | "createdAt" | "updatedAt"> & Partial<Pick<Coffret, "quantity">> = await request.json()

        // Validate coffret data
        if (!coffret.name?.trim()) {
            return NextResponse.json(
                { error: "Coffret name is required" },
                { status: 400 }
            )
        }
        if (!coffret.price || coffret.price < 0) {
            return NextResponse.json(
                { error: "Valid price is required" },
                { status: 400 }
            )
        }
        if (!Array.isArray(coffret.productIds) || coffret.productIds.length === 0) {
            return NextResponse.json(
                { error: "At least one product is required" },
                { status: 400 }
            )
        }

        const { adminDb } = await import("@/lib/utils/firebase-admin-util")

        // Compute originalPrice from selected product prices
        let originalPrice = 0
        try {
            const { getProductById } = await import("@/lib/services/product-service")
            if (Array.isArray(coffret.productIds) && coffret.productIds.length > 0) {
                const proms = coffret.productIds.map((id) => getProductById(id))
                const products = await Promise.all(proms)
                originalPrice = products.reduce((sum, p) => sum + (p?.price ?? 0), 0)
            }
        } catch (err) {
            console.error("Failed computing originalPrice during createCoffret:", err)
        }

        // Compute coffret quantity as minimum stock among selected products
        let computedQuantity = 0
        try {
            const { getProductById } = await import("@/lib/services/product-service")
            const stocks = await Promise.all(
                (coffret.productIds || []).map(async (pid: string) => {
                    const p = await getProductById(pid)
                    return p?.quantity ?? 0
                })
            )
            computedQuantity = stocks.length > 0 ? Math.min(...stocks) : 0
        } catch (err) {
            console.error("Failed computing coffret quantity during createCoffret:", err)
        }

        const docRef = await adminDb.collection(COFFRETS_COLLECTION).add({
            ...coffret,
            quantity: computedQuantity,
            originalPrice,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        })

        const docSnap = await docRef.get()
        const newCoffret = JSON.parse(
            JSON.stringify({
                id: docRef.id,
                ...docSnap.data()
            })
        ) as Coffret

        // Revalidate the coffrets cache
        revalidateTag("coffrets", "default")

        return NextResponse.json(newCoffret, { status: 201 })
    } catch (error) {
        console.error("Error creating coffret:", error)
        return NextResponse.json(
            { error: "Failed to create coffret" },
            { status: 500 }
        )
    }
}