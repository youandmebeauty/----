"use client"

import { useState, useEffect } from "react"
import { ProductCard } from "./product-card"
import { getFeaturedProducts } from "@/lib/services/product-service"
import type { Product } from "@/lib/models"
import { ScrollAnimation } from "./scroll-animation"

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeaturedProducts()
  }, [])

  const fetchFeaturedProducts = async () => {
    try {
      const featuredProducts = await getFeaturedProducts(4)
      setProducts(featuredProducts)
    } catch (error) {
      console.error("Error fetching featured products:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section className="py-16 mt-24 bg-background rounded-3xl m-4">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-foreground">Produits Vedettes</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/5] bg-secondary/20 mb-4" />
                <div className="h-4 bg-secondary/20 w-3/4 mb-2" />
                <div className="h-4 bg-secondary/20 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 mt-24 bg-background border border-border/50 rounded-3xl m-4">
      <div className="container mx-auto px-4">
        <div className="mb-16 flex items-end justify-between">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2">
              <span className="h-px w-8 bg-primary"></span>
              <span className="text-sm font-medium tracking-widest uppercase text-primary">Collection Exclusive</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-foreground">
              Produits Vedettes
            </h2>
          </div>
          <span className="text-muted-foreground hidden md:block text-xs tracking-widest uppercase border-l border-border pl-4 ml-4">02 / CURATED</span>
        </div>

        <div className="grid grid-cols-1 gap-y-16 gap-x-8 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product, index) => (
            <ScrollAnimation
              key={product.id}
              variant="slideUp"
              delay={index * 0.1}
            >
              <ProductCard product={product} />
            </ScrollAnimation>
          ))}
        </div>
      </div>
    </section>
  )
}
