"use client"

import { ProductCard } from "@/components/product-card"
import type { Product } from "@/lib/models"

interface RelatedProductsProps {
    products: Product[]
}

export function RelatedProducts({ products }: RelatedProductsProps) {
    if (products.length === 0) {
        return null
    }

    return (
        <section className="container mx-auto px-4 lg:px-8 pt-16 lg:pt-24">
            <div className="space-y-12">
                {/* Section Header */}
                <div className="text-center space-y-2">
                    <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-foreground">
                        Produits Similaires
                    </h2>
                    <p className="text-muted-foreground text-sm uppercase tracking-[0.2em]">
                        Découvrez nos recommandations
                    </p>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>
        </section>
    )
}
