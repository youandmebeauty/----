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

    const sameBrandProducts = products.filter(p => p.brand === currentProduct.brand && p.subcategory === currentProduct.subcategory)
    const sameCategoryProducts = products.filter(p => p.category === currentProduct.category && p.brand !== currentProduct.brand)
    
    const isSameBrand = sameBrandProducts.length > 0
    const isSameCategory = sameCategoryProducts.length > 0

    // If no related products, show all products
    const fallbackProducts = !isSameBrand && !isSameCategory ? products : []

    return (
        <section className="container mx-auto px-4 lg:px-8 pt-16 lg:pt-24">
            <div className="space-y-16">
                {/* Same Brand Section */}
                {isSameBrand && (
                    <div className="space-y-8">
                        <div className="text-center space-y-2">
                            <h2 className="font-semibold uppercase text-3xl md:text-4xl lg:text-5xl text-foreground">
                                Produits Similaires
                            </h2>
                            <p className="text-primary text-2xl uppercase tracking-[0.2em] font-medium">
                                DE LA MÊME MARQUE
                            </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
                            {sameBrandProducts.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Same Category Section */}
                {isSameCategory && (
                    <div className="space-y-8">
                        {!isSameBrand && (
                                <div className="text-center space-y-2">
                            <h2 className="font-semibold uppercase text-3xl md:text-4xl lg:text-5xl text-foreground">
                                    Produits Similaires
                                </h2>
                            </div>
                        )}
                        <div className="text-center">
                            <p className="text-primary text-2xl uppercase tracking-[0.2em] font-medium">
                                DE LA MÊME CATÉGORIE
                            </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
                            {sameCategoryProducts.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Fallback Section */}
                {!isSameBrand && !isSameCategory && (
                    <div className="space-y-8">
                        <div className="text-center space-y-2">
                            <h2 className="font-semibold uppercase text-3xl md:text-4xl lg:text-5xl text-foreground">
                                Produits Similaires
                            </h2>
                            <p className="text-primary text-2xl uppercase tracking-[0.2em] font-medium">
                                Découvrez nos recommandations
                            </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
                            {fallbackProducts.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </section>
    )
}