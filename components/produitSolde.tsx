"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { Product } from "@/lib/models/models"
import { ProductCard } from "@/components/product/product-card"
import { ScrollAnimation } from "@/components/navigation/scroll-animation"
import { getProducts } from "@/lib/services/product-service"
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "./ui/button"
import Link from "next/link"

export default function ProduitSolde() {
  const [discounted, setDiscounted] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [itemsPerView, setItemsPerView] = useState(5)
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

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setItemsPerView(1)
      else if (window.innerWidth < 1024) setItemsPerView(3)
      else setItemsPerView(5)
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const showSlider = discounted.length > itemsPerView

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => {
      const maxIndex = discounted.length - itemsPerView
      return prev >= maxIndex ? 0 : prev + 1
    })
  }, [discounted.length, itemsPerView])

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => {
      const maxIndex = discounted.length - itemsPerView
      return prev <= 0 ? maxIndex : prev - 1
    })
  }, [discounted.length, itemsPerView])

  // Auto-play — now after showSlider and nextSlide are defined
  useEffect(() => {
    if (!showSlider) return
    autoPlayRef.current = setInterval(nextSlide, 4000)
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current)
    }
  }, [showSlider, nextSlide])

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

  if (isLoading || discounted.length === 0) return null

  return (
    <ScrollAnimation variant="slideUp" className="mb-8">
      <div className="space-y-6">
{/* Header */}
<div className="relative flex flex-col rounded-3xl bg-gradient-to-br from-primary-50 via-primary-50/50 to-background p-8">
  <div className="text-center mb-6 flex flex-col items-center gap-4">

    {/* Label row */}
    <div className="inline-flex items-center gap-2">
      <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary"></div>
      <span className="text-xs font-medium tracking-[0.3em] uppercase text-primary">
        Une sélection exclusive d&apos;offres exceptionnelles
      </span>
      <div className="h-px w-12 bg-gradient-to-r from-primary to-transparent"></div>
    </div>

    {/* Title */}
    <h1 className="text-4xl md:text-6xl tracking-tight font-light leading-none">
      <span className="relative inline-block">
        <span className="text-foreground">Soldes</span>
        <span className="absolute -top-4 -left-4 inline-flex items-center gap-1.5 px-3 py-1 text-xs -rotate-12 font-bold bg-gradient-to-r from-accent to-primary text-white rounded-full shadow-md animate-pulse pointer-events-none">
          HOT
        </span>
      </span>
      <span className="text-foreground"> & </span>
      <span className="text-primary">Promotions</span>
    </h1>

    {/* CTA */}
    <Button
      size="sm"
      asChild
      className="mt-2 w-full sm:w-auto group bg-primary hover:bg-primary/90 text-primary-foreground h-12 px-8 rounded-full text-base font-medium transition-all duration-300 ease-out hover:scale-105"
    >
      <Link href="/solde" className="flex items-center justify-center">
        Voir tout
        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
      </Link>
    </Button>

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
                    <ProductCard product={product} />
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
                  <ProductCard product={product} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ScrollAnimation>
  )
}