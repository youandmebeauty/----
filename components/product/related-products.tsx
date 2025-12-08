"use client"

import { ProductCard } from "@/components/product-card"
import type { Product } from "@/lib/models"

interface RelatedProductsProps {
    products: Product[]
    currentProduct: Product
}

export function RelatedProducts({ products, currentProduct }: RelatedProductsProps) {
    if (products.length === 0) {
        return null
    }

    // Determine if products are from same brand or same category
    const sameBrandProducts = products.filter(p => p.brand === currentProduct.brand)
    const sameCategoryProducts = products.filter(p => p.category === currentProduct.category && p.brand !== currentProduct.brand)
    
    const isSameBrand = sameBrandProducts.length > 0
    const isSameCategory = sameCategoryProducts.length > 0

    return (
        <section className="container mx-auto px-4 lg:px-8 pt-16 lg:pt-24">
            <div className="space-y-12">
                {/* Section Header */}
                <div className="text-center space-y-2">
                    <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-foreground">
                        Produits Similaires
                    </h2>
                    <div className="space-y-1">
                        {isSameBrand && (
                            <p className="text-primary text-sm uppercase tracking-[0.2em] font-semibold">
                                DE LA MÊME MARQUE
                            </p>
                        )}
                        {isSameCategory && (
                            <p className="text-muted-foreground text-sm uppercase tracking-[0.2em]">
                                DE LA MÊME CATÉGORIE
                            </p>
                        )}
                        {!isSameBrand && !isSameCategory && (
                            <p className="text-muted-foreground text-sm uppercase tracking-[0.2em]">
                                Découvrez nos recommandations
                            </p>
                        )}
                    </div>
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
