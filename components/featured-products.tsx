"use client"

import { useState, useEffect, useRef } from "react"
import { ProductCard } from "./product-card"
import { getFeaturedProducts } from "@/lib/services/product-service"
import type { Product } from "@/lib/models"
import { ScrollAnimation } from "./scroll-animation"
import { ChevronLeft, ChevronRight } from "lucide-react"

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchFeaturedProducts()
  }, [])

  const fetchFeaturedProducts = async () => {
    try {
      const featuredProducts = await getFeaturedProducts(7)
      setProducts(featuredProducts)
    } catch (error) {
      console.error("Error fetching featured products:", error)
    } finally {
      setLoading(false)
    }
  }

  const showSlider = products.length > 4

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % products.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + products.length) % products.length)
  }

  const getVisibleProducts = () => {
    if (!showSlider) return products
    
    const visible = []
    for (let i = 0; i < 4; i++) {
      visible.push(products[(currentIndex + i) % products.length])
    }
    return visible
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
              <span className="text-sm font-medium tracking-widest uppercase text-primary">Sélection Exclusive</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-foreground">
              Produits Vedettes
            </h2>
          </div>
          <span className="text-muted-foreground hidden md:block text-xs tracking-widest uppercase border-l border-border pl-4 ml-4">02 / CURATED</span>
        </div>

        {showSlider ? (
          <div className="relative">
            <div className="overflow-hidden" ref={scrollRef}>
              <div className="grid grid-cols-1 gap-y-16 gap-x-8 sm:grid-cols-2 lg:grid-cols-4 transition-all duration-500">
                {getVisibleProducts().map((product, index) => (
                  <div key={`${product.id}-${currentIndex}-${index}`}>
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={prevSlide}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-background border border-border rounded-full p-3 shadow-lg hover:bg-secondary transition-colors z-10"
              aria-label="Previous products"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={nextSlide}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-background border border-border rounded-full p-3 shadow-lg hover:bg-secondary transition-colors z-10"
              aria-label="Next products"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            <div className="flex justify-center gap-2 mt-8">
              {products.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentIndex
                      ? "w-8 bg-primary"
                      : "w-2 bg-border hover:bg-primary/50"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-y-16  min-h-[500px] gap-x-8 sm:grid-cols-2 lg:grid-cols-4">
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
        )}
      </div>
    </section>
  )
}