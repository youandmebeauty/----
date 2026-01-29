"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { gsap } from "@/lib/gsap"
import { ProductCard } from "@/components/product/product-card"
import type { Product } from "@/lib/models"
import { SHOP_CATEGORIES } from "@/lib/category-data"

interface ProductGridProps {
    products: Product[]
    loading: boolean
    clearAllFilters: () => void
    onProductNavigate?: () => void
    grouping?: "none" | "category" | "subcategory"
}

export function ProductGrid({ products, loading, clearAllFilters, onProductNavigate, grouping = "none" }: ProductGridProps) {
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

    const getCategoryLabels = (product: Product) => {
        let categoryLabel = product.category
        let subcategoryLabel = product.subcategory

        const category = SHOP_CATEGORIES.find((c) => c.id === product.category)
        if (category) {
            categoryLabel = category.label
            const sub = category.subcategories?.find((s) => s.id === product.subcategory)
            if (sub) {
                subcategoryLabel = sub.label
            } else if (category.subcategories) {
                // Look one level deeper when nested
                for (const s of category.subcategories) {
                    const child = s.subcategories?.find((c) => c.id === product.subcategory)
                    if (child) {
                        subcategoryLabel = child.label
                        break
                    }
                }
            }
        }

        return {
            categoryLabel: categoryLabel || "Autre",
            subcategoryLabel: subcategoryLabel || categoryLabel || "Autre",
        }
    }

    const groupedSections = useMemo(() => {
        if (grouping === "none") {
            return [{ key: "all", title: null as string | null, items: visibleProducts }]
        }

        const map = new Map<string, { title: string; items: Product[] }>()

        visibleProducts.forEach((product) => {
            const { categoryLabel, subcategoryLabel } = getCategoryLabels(product)
            const title = grouping === "subcategory" ? subcategoryLabel : categoryLabel
            const key = `${grouping}-${title}`
            if (!map.has(key)) {
                map.set(key, { title, items: [] })
            }
            map.get(key)!.items.push(product)
        })

        return Array.from(map.values())
    }, [visibleProducts, grouping])

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

    const showSectionNav = grouping !== "none" && groupedSections.length > 1

    return (
        <div className="space-y-12">
            {showSectionNav && (
                <div className="sticky top-20 z-10 bg-background/80 backdrop-blur-xl border-b border-border/40">
                    <div className="-mx-4 px-4 py-5">
                        <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-hide">
                            {groupedSections.map((section, index) => (
                                <a
                                    key={section.title || "all"}
                                    href={`#section-${(section.title || "all").replace(/\s+/g, "-").toLowerCase()}`}
                                    className="group relative flex-shrink-0 inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-muted/50 hover:bg-primary/10 border border-transparent hover:border-primary/20 transition-all duration-300"
                                >
                                    <span className="text-sm font-medium text-foreground/70 group-hover:text-primary transition-colors whitespace-nowrap">
                                        {section.title || "Produits"}
                                    </span>
                                    <span className="inline-flex items-center justify-center min-w-[1.75rem] h-5 px-2 text-xs font-semibold rounded-lg bg-background/80 text-foreground/60 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                                        {section.items.length}
                                    </span>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div ref={gridRef} className="space-y-20">
                {groupedSections.map((section, sectionIndex) => (
                    <div key={section.title || "all"} className="space-y-8">
                        {section.title && (
                            <div 
                                id={`section-${section.title.replace(/\s+/g, "-").toLowerCase()}`} 
                                className="scroll-mt-32"
                            >
                                <div className="flex items-center justify-between gap-4 pb-6">
                                    <div className="flex items-center gap-4">
                                        <h3 className="text-3xl font-bold tracking-tight text-foreground">
                                            {section.title}
                                        </h3>
                                        <span className="inline-flex items-center justify-center min-w-[2rem] h-7 px-3 text-sm font-semibold rounded-lg bg-primary/10 text-primary">
                                            {section.items.length}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 xl:grid-cols-4">
                            {section.items.map((product) => (
                                <div key={product.id} data-product-id={product.id} className="product-grid-item">
                                    <ProductCard product={product} onNavigateStart={onProductNavigate} />
                                </div>
                            ))}

                            {loading && products.length > 0 && (
                                [...Array(8)].map((_, i) => (
                                    <div key={`skeleton-${i}`} className="product-grid-item space-y-3 animate-pulse">
                                        <div className="aspect-[3/4] bg-muted rounded-xl" />
                                        <div className="h-3 bg-muted w-3/4 rounded-lg" />
                                        <div className="h-3 bg-muted w-1/2 rounded-lg" />
                                    </div>
                                ))
                            )}
                        </div>
                        
                        {section.title && sectionIndex < groupedSections.length - 1 && (
                            <div className="pt-12">
                                <div className="w-full h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {hasMore && (
                <div className="flex flex-col items-center gap-6 pt-12">
                    <button
                        onClick={() => setVisibleCount(count => Math.min(count + LOAD_MORE_STEP, products.length))}
                        className="group relative px-6 py-4 rounded-full bg-primary text-primary-foreground font-medium hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-0.5 transition-all duration-300"
                        type="button"
                    >
                        <span className="flex items-center gap-2.5">
                            Charger plus
                            <svg className="w-4 h-4 group-hover:translate-y-0.5 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </span>
                    </button>
                    <div className="text-sm text-muted-foreground font-medium">
                        {visibleCount} / {products.length} produits
                    </div>
                </div>
            )}
        </div>
    )
}