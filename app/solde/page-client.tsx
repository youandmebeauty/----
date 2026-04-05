"use client"

import { useEffect, useMemo, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Product } from "@/lib/models/models"
import { ProductCard } from "@/components/product/product-card"
import { ScrollAnimation } from "@/components/navigation/scroll-animation"
import { getProducts } from "@/lib/services/product-service"
import { SHOP_CATEGORIES } from "@/lib/category-data"
import { cn } from "@/lib/utils/utils"
import { Breadcrumb } from "@/components/navigation/breadcrumb"

export default function SoldePage() {
  const [discounted, setDiscounted] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

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

  const selectedCategory =
    searchParams.get("category") || searchParams.get("categorie") || "all"

  const availableCategories = useMemo(() => {
    const categoryIds = Array.from(new Set(discounted.map((product) => product.category)))

    return categoryIds
      .map((id) => {
        const found = SHOP_CATEGORIES.find((category) => category.id === id)
        return {
          id,
          label: found?.label || id,
        }
      })
      .sort((a, b) => a.label.localeCompare(b.label, "fr"))
  }, [discounted])

  const filteredProducts = useMemo(() => {
    if (selectedCategory === "all") {
      return discounted
    }

    return discounted.filter((product) => product.category === selectedCategory)
  }, [discounted, selectedCategory])

  const handleCategoryChange = (categoryId: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (categoryId === "all") {
      params.delete("category")
    } else {
      params.set("category", categoryId)
    }

    params.delete("categorie")

    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  const maxDiscount =
    filteredProducts.length > 0
      ? Math.max(
          ...filteredProducts.map((p) =>
            Math.round(((p.price - (p.promoPrice as number)) / p.price) * 100)
          )
        )
      : 0

  if (isLoading || discounted.length === 0) {
    return null
  }

  return (
    <ScrollAnimation variant="slideUp" className="min-h-screen bg-background">

            <div className="container mx-auto  px-4 lg:px-6 xl:px-8 py-8">
                <ScrollAnimation variant="slideUp" className="mb-6">
                  <Breadcrumb
                    items={[{ name: "Soldes", href: "/solde", current: true }]}
                  />
                </ScrollAnimation>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-50 via-primary-50/50 to-background p-8">
          <div className="relative flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <span className="-ml-4 inline-flex -rotate-12 items-center gap-1.5 rounded-full bg-gradient-to-r from-accent to-primary px-3 py-1 text-xs font-bold text-white shadow-md animate-pulse">
                HOT
              </span>

              <h2 className="text-3xl font-bold tracking-tight leading-tight sm:text-4xl">
                <span className="text-foreground">Soldes & </span>
                <span className="text-primary">Promotions</span>
              </h2>

              <p className="mt-2 text-muted-foreground">
                Une selection exclusive d&apos;offres exceptionnelles
              </p>
            </div>

            <div className="flex w-full items-center justify-around gap-4 sm:w-auto">
              <div>
                <div className="text-xs uppercase text-muted-foreground">Offres disponibles</div>
                <div className="text-3xl font-bold">{filteredProducts.length}</div>
              </div>

              <div className="hidden h-14 w-px bg-border/40 sm:block" />

              <div className="z-50 rounded-2xl bg-gradient-to-br from-primary to-accent px-5 py-3 shadow-lg">
                <div className="mb-1 text-xs uppercase text-white/90">Jusqu&apos;a</div>
                <div className="text-2xl font-bold text-white">-{maxDiscount}%</div>
              </div>
            </div>
          </div>
        </div>
                            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        <div className="rounded-2xl p-4 sm:p-5 mb-4">
          <div className="mb-3 text-sm font-medium text-muted-foreground">
            Filtrer par categorie
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleCategoryChange("all")}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                selectedCategory === "all"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              )}
              type="button"
            >
              Toutes ({discounted.length})
            </button>

            {availableCategories.map((category) => {
              const count = discounted.filter(
                (product) => product.category === category.id
              ).length

              return (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id)}
                  className={cn(
                                "flex-shrink-0 px-8 py-2 text-[13px]  uppercase whitespace-nowrap transition-all duration-200 border",
                    selectedCategory === category.id
                                    ? "bg-primary text-primary-foreground border-primary rounded-md"
                                    : "bg-transparent text-muted-foreground border-border/50 hover:border-primary hover:text-foreground rounded-md"
                            )}
                  type="button"
                >
                  {category.label} ({count})
                </button>
              )
            })}
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center">
            <p className="mb-4 text-muted-foreground">
              Aucun produit en promotion dans cette categorie.
            </p>
            <button
              onClick={() => handleCategoryChange("all")}
              className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground"
              type="button"
            >
              Voir toutes les promotions
            </button>
          </div>
        ) : (
          <ScrollAnimation
            variant="slideUp"
            delay={0.2}
            duration={1}
            stagger={0.08}
            childSelector=".product-item"
            ease="expo"
            className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 xl:grid-cols-4"
          >
            {filteredProducts.map((product) => (
              <div key={product.id} className="product-item">
                <div className="relative">
                  <div className="absolute -top-2 -right-2 z-10">
                    <div className="rotate-12 rounded-full bg-gradient-to-br from-red-600 to-red-500 px-3 py-1.5 text-xs font-bold text-white shadow-lg">
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
        )}
      </div>
    </ScrollAnimation>
  )
}
