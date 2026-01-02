"use client"

import { useEffect, useRef, useState } from "react"
import { gsap } from "@/lib/gsap"
import { ProductCard } from "@/components/product-card"
import type { Product } from "@/lib/models"

interface ProductGridProps {
    products: Product[]
    loading: boolean
    clearAllFilters: () => void
}

export function ProductGrid({ products, loading, clearAllFilters }: ProductGridProps) {
    const INITIAL_VISIBLE_COUNT = 12
    const LOAD_MORE_STEP = 12

    const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT)
    const animatedIdsRef = useRef<Set<string>>(new Set())
    const gridRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        // Reset visible products when a new product list is loaded
        setVisibleCount(INITIAL_VISIBLE_COUNT)
        animatedIdsRef.current.clear()
    }, [products])

    const visibleProducts = products.slice(0, visibleCount)
    const hasMore = visibleCount < products.length

    useEffect(() => {
        const container = gridRef.current
        if (!container) return

        const ctx = gsap.context(() => {
            visibleProducts.forEach((product, index) => {
                if (animatedIdsRef.current.has(product.id)) {
                    return
                }

                const element = container.querySelector<HTMLDivElement>(
                    `[data-product-id="${product.id}"]`
                )

                if (!element) return

                animatedIdsRef.current.add(product.id)

                const delay = (index % LOAD_MORE_STEP) * 0.05

                gsap.fromTo(
                    element,
                    { opacity: 0, y: 20 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.4,
                        delay,
                        ease: "power1.out",
                    }
                )
            })
        }, container)

        return () => ctx.revert()
    }, [visibleProducts, LOAD_MORE_STEP])

    if (loading && products.length === 0) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8 lg:gap-x-6 lg:gap-y-12">
                {[...Array(12)].map((_, i) => (
                    <div key={i} className="space-y-3 animate-pulse">
                        <div className="aspect-[3/4] bg-muted rounded" />
                        <div className="h-3 bg-muted w-3/4 rounded" />
                        <div className="h-3 bg-muted w-1/2 rounded" />
                    </div>
                ))}
            </div>
        )
    }

    if (products.length === 0) {
        return (
            <div className="text-center py-20">
                <p className="text-muted-foreground mb-4">Aucun produit trouvé</p>
                <button 
                    onClick={clearAllFilters}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors underline"
                    type="button"
                >
                    Réinitialiser les filtres
                </button>
            </div>
        )
    }

    return (
        <div className="space-y-10">
            <div
                ref={gridRef}
                className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:gap-x-6 lg:gap-y-12 xl:grid-cols-4"
            >
                {visibleProducts.map((product) => (
                    <div key={product.id} data-product-id={product.id} className="product-grid-item">
                        <ProductCard product={product} />
                    </div>
                ))}

                {loading && products.length > 0 && (
                    [...Array(8)].map((_, i) => (
                        <div key={`skeleton-${i}`} className="product-grid-item space-y-3 animate-pulse">
                            <div className="aspect-[3/4] bg-muted rounded" />
                            <div className="h-3 bg-muted w-3/4 rounded" />
                            <div className="h-3 bg-muted w-1/2 rounded" />
                        </div>
                    ))
                )}
            </div>

            {hasMore && (
                <div className="flex justify-center">
                    <button
                        onClick={() => setVisibleCount(count => Math.min(count + LOAD_MORE_STEP, products.length))}
                        className="px-6 py-3 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                        type="button"
                    >
                        Voir plus
                    </button>
                </div>
            )}
        </div>
    )
}