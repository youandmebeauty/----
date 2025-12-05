"use client"

import { motion } from "framer-motion"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import type { Product } from "@/lib/models"

interface ProductGridProps {
    products: Product[]
    loading: boolean
    clearAllFilters: () => void
}

export function ProductGrid({ products, loading, clearAllFilters }: ProductGridProps) {
    if (loading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8 lg:gap-x-6 lg:gap-y-12">
                {[...Array(12)].map((_, i) => (
                    <div key={i} className="space-y-3 animate-pulse">
                        <div className="aspect-[3/4] bg-muted" />
                        <div className="h-3 bg-muted w-3/4" />
                        <div className="h-3 bg-muted w-1/2" />
                    </div>
                ))}
            </div>
        )
    }

    if (products.length === 0) {
        return (
            <div className="text-center py-20">
                <h3 className="text-lg font-medium mb-2">Aucun produit trouvé</h3>
                <p className="text-sm text-muted-foreground mb-6">
                    Essayez d'ajuster vos filtres pour voir plus de résultats
                </p>
                <Button variant="outline" onClick={clearAllFilters}>
                    Réinitialiser les filtres
                </Button>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8 lg:gap-x-6 lg:gap-y-12">
            {products.map((product, index) => (
                <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                    <ProductCard product={product} />
                </motion.div>
            ))}
        </div>
    )
}
