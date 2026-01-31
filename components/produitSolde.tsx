"use client"

import { useEffect, useState, useRef } from "react"
import { Product } from "@/lib/models/models"
import { ProductCard } from "@/components/product/product-card"
import { ScrollAnimation } from "@/components/navigation/scroll-animation"
import { getProducts } from "@/lib/services/product-service"
import { ChevronLeft, ChevronRight } from "lucide-react"

export default function ProduitSolde() {
  const [discounted, setDiscounted] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isNavigating, setIsNavigating] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [itemsPerView, setItemsPerView] = useState(5)
  const [isAutoPlaying] = useState(true)
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const products = await getProducts()
        const promos = products.filter(
          (p) => typeof p.promoPrice === "number" && p.promoPrice < p.price
        )
        setDiscounted(promos)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // Responsive items per view
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setItemsPerView(1)
      } else if (window.innerWidth < 1024) {
        setItemsPerView(3)
      } else {
        setItemsPerView(5)
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Auto-play
  useEffect(() => {
    if (!isAutoPlaying || !showSlider) return

    autoPlayRef.current = setInterval(() => {
      nextSlide()
    }, 4000)

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current)
      }
    }
  }, [isAutoPlaying, currentIndex, itemsPerView, discounted.length])

  const showSlider = discounted.length > itemsPerView

  const nextSlide = () => {
    setCurrentIndex((prev) => {
      const maxIndex = discounted.length - itemsPerView
      return prev >= maxIndex ? 0 : prev + 1
    })
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => {
      const maxIndex = discounted.length - itemsPerView
      return prev <= 0 ? maxIndex : prev - 1
    })
  }

  const getVisibleProducts = () => {
    if (!showSlider) return discounted
    return discounted.slice(currentIndex, currentIndex + itemsPerView)
  }

  const maxDots = discounted.length - itemsPerView + 1

  const maxDiscount =
    discounted.length > 0
      ? Math.max(
          ...discounted.map((p) =>
            Math.round(((p.price - (p.promoPrice as number)) / p.price) * 100)
          )
        )
      : 0

  if (isLoading) {
    return (
      <div className="py-16 mt-24 bg-background rounded-3xl m-4">
        <div className="container mx-auto px-4">

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
      </div>
    )
  }

  if (discounted.length === 0) {
    return null
  }

  return (
    <ScrollAnimation variant="slideUp" className="mb-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-50 via-primary-50/50 to-background p-8">
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <span className="-ml-4 inline-flex items-center gap-1.5 px-3 py-1 text-xs -rotate-12 font-bold bg-gradient-to-r from-accent to-primary text-white rounded-full shadow-md animate-pulse">
                HOT
              </span>

              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
                <span className="text-foreground">Soldes & </span>
                <span className="text-primary">Promotions</span>
              </h2>

              <p className="text-muted-foreground mt-2">
                Une sélection exclusive d&apos;offres exceptionnelles
              </p>
            </div>

            <div className="flex items-center gap-4 justify-around w-full sm:w-auto">
              <div>
                <div className="text-xs uppercase text-muted-foreground">
                  Offres disponibles
                </div>
                <div className="text-3xl font-bold">
                  {discounted.length}
                </div>
              </div>

              <div className="hidden sm:block w-px h-14 bg-border/40" />

              <div className="bg-gradient-to-br z-50 from-primary to-accent rounded-2xl px-5 py-3 shadow-lg">
                <div className="text-white/90 text-xs uppercase mb-1">
                  Jusqu&apos;à
                </div>
                <div className="text-2xl font-bold text-white">
                  -{maxDiscount}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products — Slider */}
        {showSlider ? (
          <div className="relative px-8 sm:px-12 lg:px-0">
            <ScrollAnimation
              variant="slideUp"
              delay={0.3}
              duration={1}
              stagger={0.15}
              childSelector=".product-item"
              ease="expo"
              className="grid grid-cols-1 gap-y-16 gap-x-8 sm:grid-cols-3 lg:grid-cols-5 transition-all duration-500"
            >
              {getVisibleProducts().map((product, index) => (
                <div key={`${product.id}-${currentIndex}-${index}`} className="product-item">
                  <div className="relative">
                    <div className="absolute -top-2 -right-2 z-10">
                      <div className="bg-gradient-to-br from-red-600 to-red-500 text-white font-bold text-xs px-3 py-1.5 rounded-full shadow-lg rotate-12">
                        -{Math.round(
                          ((product.price - product.promoPrice!) / product.price) * 100
                        )}%
                      </div>
                    </div>
                    <ProductCard
                      product={product}
                      onNavigateStart={() => setIsNavigating(true)}
                    />
                  </div>
                </div>
              ))}
            </ScrollAnimation>

            {/* Dots */}
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: maxDots }).map((_, index) => (
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

            {/* Prev button */}
            <button
              onClick={prevSlide}
              className="absolute left-0 top-1/2 -translate-y-1/2 sm:-translate-x-6 bg-background border border-border rounded-full p-2 sm:p-3 shadow-lg hover:bg-secondary transition-colors z-10"
              aria-label="Previous products"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Next button */}
            <button
              onClick={nextSlide}
              className="absolute right-0 top-1/2 -translate-y-1/2 sm:translate-x-6 bg-background border border-border rounded-full p-2 sm:p-3 shadow-lg hover:bg-secondary transition-colors z-10"
              aria-label="Next products"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        ) : (
          /* 4 or fewer — static centered grid, no slider needed */
          <div className="flex gap-4 flex-wrap justify-center">
            {discounted.map((product) => (
              <div key={product.id} className="w-56">
                <div className="relative">
                  <div className="absolute -top-2 -right-2 z-10">
                    <div className="bg-gradient-to-br from-red-600 to-red-500 text-white font-bold text-xs px-3 py-1.5 rounded-full shadow-lg rotate-12">
                      -{Math.round(
                        ((product.price - product.promoPrice!) / product.price) * 100
                      )}%
                    </div>
                  </div>
                  <ProductCard
                    product={product}
                    onNavigateStart={() => setIsNavigating(true)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ScrollAnimation>
  )
}