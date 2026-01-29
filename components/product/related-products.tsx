"use client"

import { ProductCard } from "@/components/product/product-card"
import type { Product } from "@/lib/models"
import { useState } from "react"
import { LoadingAnimation } from "@/components/ui/loading-animation"

interface RelatedProductsProps {
    products: Product[]
    currentProduct: Product
}

export function RelatedProducts({ products, currentProduct }: RelatedProductsProps) {
    const [isNavigating, setIsNavigating] = useState(false)

    if (products.length === 0) {
        return null
    }

    const perfumeNoteTags = currentProduct.category === "parfum" && currentProduct.perfumeNotes
        ? Array.from(new Set([
            ...(currentProduct.perfumeNotes.top ?? []),
            ...(currentProduct.perfumeNotes.heart ?? []),
            ...(currentProduct.perfumeNotes.base ?? []),
        ].filter(Boolean)))
        : []

    const hasPerfumeNotes = perfumeNoteTags.length > 0

    const sameBrandProducts = products.filter(p => p.brand === currentProduct.brand && p.subcategory === currentProduct.subcategory)
    const sameCategoryProducts = products.filter(p => p.category === currentProduct.category && p.brand !== currentProduct.brand)
    
    const isSameBrand = sameBrandProducts.length > 0
    const isSameCategory = sameCategoryProducts.length > 0

    const fallbackProducts = !isSameBrand && !isSameCategory ? products : []

    const navigationOverlay = isNavigating ? (
        <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
            <LoadingAnimation size={140} className="text-primary" />
        </div>
    ) : null

    return (
        <section className="container mx-auto px-4 lg:px-8 py-20 ">
            {navigationOverlay}
            <div className="space-y-20">
                {hasPerfumeNotes && (
                    <div className="space-y-6 text-center max-w-3xl mx-auto">
                        <div className="flex items-center justify-center gap-4">
                            <div className="h-px w-12 bg-gradient-to-r from-transparent to-zinc-300"></div>
                            <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-light">
                                Signature olfactive
                            </p>
                            <div className="h-px w-12 bg-gradient-to-l from-transparent to-zinc-300"></div>
                        </div>
                        <div className="flex flex-wrap justify-center gap-2">
                            {perfumeNoteTags.map((note) => (
                                <span
                                    key={note}
                                    className="px-4 py-2 text-xs tracking-wide font-light border border-zinc-200 hover:border-zinc-400 hover:shadow-sm transition-all duration-300 rounded-sm"
                                >
                                    {note}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Same Brand Section */}
                {isSameBrand && (
                    <div className="space-y-12">
                        <div className="text-center space-y-4">
                            <h2 className="font-light text-primary text-3xl md:text-4xl lg:text-4xl tracking-tight">
                                Produits Similaires
                            </h2>
                            <div className="flex items-center justify-center gap-4">
                            <div className="h-px w-12 bg-gradient-to-r from-transparent to-zinc-300"></div>
                                <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-light">
                                    De la même marque
                                </p>
                                                            <div className="h-px w-12 bg-gradient-to-l from-transparent to-zinc-300"></div>

                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
                            {sameBrandProducts.map((product) => (
                                <ProductCard key={product.id} product={product} onNavigateStart={() => setIsNavigating(true)} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Same Category Section */}
                {isSameCategory && (
                    <div className="space-y-12">
                        {!isSameBrand && (
                            <div className="text-center space-y-4">
                                <h2 className="font-light text-3xl md:text-4xl lg:text-5xl tracking-tight">
                                    Produits Similaires
                                </h2>
                            </div>
                        )}
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-4 mb-12">
                            <div className="h-px w-12 bg-gradient-to-r from-transparent to-zinc-300"></div>
                                <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-light">
                                    De la même catégorie
                                </p>
                                <div className="h-px w-12 bg-gradient-to-l from-transparent to-zinc-300"></div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
                            {sameCategoryProducts.map((product) => (
                                <ProductCard key={product.id} product={product} onNavigateStart={() => setIsNavigating(true)} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Fallback Section */}
                {!isSameBrand && !isSameCategory && (
                    <div className="space-y-12">
                        <div className="text-center space-y-4">
                            <h2 className="font-light text-3xl md:text-4xl lg:text-5xl text-zinc-900 tracking-tight">
                                Produits Similaires
                            </h2>
                            <div className="flex items-center justify-center gap-4">
                                <div className="h-px w-8 bg-zinc-300"></div>
                                <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-light">
                                    Découvrez nos recommandations
                                </p>
                                <div className="h-px w-8 bg-zinc-300"></div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
                            {fallbackProducts.map((product) => (
                                <ProductCard key={product.id} product={product} onNavigateStart={() => setIsNavigating(true)} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </section>
    )
}