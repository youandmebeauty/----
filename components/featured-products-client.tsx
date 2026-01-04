"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { ProductCard } from "./product-card"
import { getFeaturedProducts } from "@/lib/services/product-service"
import type { Product } from "@/lib/models"
import { ScrollAnimation } from "./scroll-animation"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { LoadingAnimation } from "@/components/ui/loading-animation"

export function FeaturedProductsClient() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [itemsPerView, setItemsPerView] = useState(5)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [isNavigating, setIsNavigating] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    fetchFeaturedProducts()
  }, [])

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

  // Auto-play functionality
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
  }, [isAutoPlaying, currentIndex, itemsPerView, products.length])


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

  const getVisibleProducts = () => {
    if (!showSlider) return products
    
    const visible = []
    for (let i = 0; i < itemsPerView; i++) {
      const index = currentIndex + i
      if (index < products.length) {
        visible.push(products[index])
      }
    }
    return visible
  }

  const maxDots = products.length - itemsPerView + 1

  const navigationOverlay = isNavigating ? (
    <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
      <LoadingAnimation size={140} className="text-primary" />
    </div>
  ) : null

  if (loading) {
    return (
      <div className="py-16 mt-24 bg-background rounded-3xl m-4">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-medium tracking-tight text-foreground">Produits Vedettes</h2>
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
      </div>
    )
  }

  return (
    <div className="py-10 mt-10 bg-background border border-border/50 rounded-3xl m-4 shadow-inner relative">
      {navigationOverlay}
      <div className="container mx-auto px-4">
        <ScrollAnimation
          variant="slideUp"
          duration={0.7}
          stagger={0.2}
          delay={0.2}
          className="mb-10 text-center"
        >
          <div className="inline-flex items-center gap-2 mb-4">
                            <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary"></div>
            <span className="text-xs font-medium tracking-[0.3em] uppercase text-primary">Sélection Exclusive</span>
            <div className="h-px w-12 bg-gradient-to-r from-primary to-transparent"></div>
          </div>

          <h1 className="text-4xl md:text-6xl tracking-tight font-light leading-none">
            Produits Vedettes
          </h1>
        </ScrollAnimation>

        {showSlider ? (
          <div className="relative px-8 sm:px-12 lg:px-0">
            <div className="flex flex-col justify-around" ref={scrollRef}>
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
                    <ProductCard product={product} onNavigateStart={() => setIsNavigating(true)} />
                  </div>
                ))}
              </ScrollAnimation>
              
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
            </div>

            <button
              onClick={prevSlide}
              className="absolute left-0 top-1/2 -translate-y-1/2 sm:-translate-x-6 bg-background border border-border rounded-full p-2 sm:p-3 shadow-lg hover:bg-secondary transition-colors z-10"
              aria-label="Previous products"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <button
              onClick={nextSlide}
              className="absolute right-0 top-1/2 -translate-y-1/2 sm:translate-x-6 bg-background border border-border rounded-full p-2 sm:p-3 shadow-lg hover:bg-secondary transition-colors z-10"
              aria-label="Next products"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
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
            className="grid grid-cols-1 gap-y-16 gap-x-8 sm:grid-cols-2 lg:grid-cols-4"
          >
            {products.map((product) => (
              <div key={product.id} className="product-item">
                <ProductCard product={product} onNavigateStart={() => setIsNavigating(true)} />
              </div>
            ))}
          </ScrollAnimation>
        )}
      </div>
    </div>
  )
}