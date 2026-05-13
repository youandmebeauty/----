"use client"

import { useState, useEffect, useRef } from "react"
import { ProductCard } from "../product/product-card"
import { getFeaturedProducts } from "@/lib/services/product-service"
import type { Product } from "@/lib/models/models"
import { ScrollAnimation } from "../navigation/scroll-animation"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { LoadingAnimation } from "@/components/ui/loading-animation"

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [itemsPerView, setItemsPerView] = useState(5)
  const [isNavigating, setIsNavigating] = useState(false)
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    fetchFeaturedProducts()
  }, [])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setItemsPerView(2)
      else if (window.innerWidth < 1024) setItemsPerView(4)
      else setItemsPerView(7)
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const showSlider = products.length > itemsPerView

  const nextSlide = () => {
    setCurrentIndex((prev) => {
      const maxIndex = products.length - itemsPerView
      return prev >= maxIndex ? 0 : prev + 1
    })
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => {
      const maxIndex = products.length - itemsPerView
      return prev <= 0 ? maxIndex : prev - 1
    })
  }

  useEffect(() => {
    if (!showSlider) return
    autoPlayRef.current = setInterval(nextSlide, 4000)
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current)
    }
  }, [showSlider, currentIndex, itemsPerView, products.length])

  const fetchFeaturedProducts = async () => {
    try {
      const featuredProducts = await getFeaturedProducts(12)
      setProducts(featuredProducts)
    } catch (error) {
      console.error("Error fetching featured products:", error)
    } finally {
      setLoading(false)
    }
  }

  const getVisibleProducts = () => {
    if (!showSlider) return products
    return products.slice(currentIndex, currentIndex + itemsPerView)
  }

  const maxDots = products.length - itemsPerView + 1

  if (loading) {
    return (
      <div className="py-10 mt-10 bg-background border border-border/50 rounded-3xl mx-4 shadow-inner">
        <div className="container mx-auto px-4">
          {/* Skeleton header */}
          <div className="mb-10 flex flex-col items-center gap-3">
            <div className="h-3 w-48 bg-secondary/30 rounded-full animate-pulse" />
            <div className="h-8 w-64 bg-secondary/20 rounded animate-pulse" />
          </div>
          {/* Skeleton cards — correct aspect ratio */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4 lg:grid-cols-7">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="animate-pulse space-y-3">
                <div className="aspect-[3/4] w-full bg-secondary/20 rounded-xl" />
                <div className="h-2.5 bg-secondary/20 rounded w-2/3" />
                <div className="h-3 bg-secondary/20 rounded w-full" />
                <div className="h-3 bg-secondary/20 rounded w-3/4" />
                <div className="h-3 bg-secondary/20 rounded w-1/3" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (products.length === 0) return null

  return (
    <div className="py-10 mt-10 bg-background border border-border/50 rounded-3xl mx-4 shadow-inner relative">
      {/* Navigation overlay */}
      {isNavigating && (
        <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
          <LoadingAnimation size={140} className="text-primary" />
        </div>
      )}

      <div className="container mx-auto px-4">
        {/* Section header */}
        <ScrollAnimation
          variant="slideUp"
          duration={0.7}
          stagger={0.2}
          delay={0.2}
          className="mb-10 text-center"
        >
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary" />
            <span className="text-xs font-medium tracking-[0.3em] uppercase text-primary">
              Sélection Exclusive
            </span>
            <div className="h-px w-12 bg-gradient-to-r from-primary to-transparent" />
          </div>
          <h2 className="text-4xl md:text-6xl tracking-tight font-light leading-none">
            Produits Vedettes
          </h2>
        </ScrollAnimation>

        {showSlider ? (
          <div className="relative px-8 sm:px-12 lg:px-0">
            <ScrollAnimation
              variant="slideUp"
              delay={0.3}
              duration={1}
              stagger={0.15}
              childSelector=".product-item"
              ease="expo"
              className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-4 lg:grid-cols-7 transition-all duration-500"
            >
              {getVisibleProducts().map((product, index) => (
                <div key={`${product.id}-${currentIndex}-${index}`} className="product-item">
                  <ProductCard
                    product={product}
                    onNavigateStart={() => setIsNavigating(true)}
                  />
                </div>
              ))}
            </ScrollAnimation>

            {/* Dots */}
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: maxDots }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-1.5 rounded-full transition-all ${
                    index === currentIndex
                      ? "w-8 bg-primary"
                      : "w-1.5 bg-border hover:bg-primary/50"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            {/* Prev */}
            <button
              onClick={prevSlide}
              className="absolute left-0 top-[40%] -translate-y-1/2 sm:-translate-x-4 bg-background border border-border rounded-full p-2 sm:p-2.5 shadow-lg hover:bg-secondary transition-colors z-10"
              aria-label="Previous products"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Next */}
            <button
              onClick={nextSlide}
              className="absolute right-0 top-[40%] -translate-y-1/2 sm:translate-x-4 bg-background border border-border rounded-full p-2 sm:p-2.5 shadow-lg hover:bg-secondary transition-colors z-10"
              aria-label="Next products"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        ) : (
          <ScrollAnimation
            variant="slideUp"
            delay={0.3}
            duration={1}
            stagger={0.15}
            childSelector=".product-item"
            ease="expo"
            className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4"
          >
            {products.map((product) => (
              <div key={product.id} className="product-item">
                <ProductCard
                  product={product}
                  onNavigateStart={() => setIsNavigating(true)}
                />
              </div>
            ))}
          </ScrollAnimation>
        )}
      </div>
    </div>
  )
}