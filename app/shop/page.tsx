"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { searchProducts } from "@/lib/services/product-service"
import type { Product, SearchFilters } from "@/lib/models"
import { SHOP_CATEGORIES } from "@/lib/category-data"
import { Sparkles, User, Wind } from "lucide-react"

// Components
import { ShopHeader } from "@/components/shop/shop-header"
import { ShopFilters } from "@/components/shop/shop-filters"
import { ProductGrid } from "@/components/shop/product-grid"
import { FeaturedSection } from "@/components/shop/featured-section"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

function ShopContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [isRefetching, setIsRefetching] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [expandedFilters, setExpandedFilters] = useState<string[]>(['category', 'skinType', 'hairType', 'price'])
  const [hasDismissedSoinsModal, setHasDismissedSoinsModal] = useState(false)

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null)
  const [selectedSkinTypes, setSelectedSkinTypes] = useState<string[]>([])
  const [selectedHairTypes, setSelectedHairTypes] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState([0, 200])
  const [sortBy, setSortBy] = useState("featured")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const category = searchParams.get("category") || "all"
    const subcategory = searchParams.get("subcategory")
    const search = searchParams.get("search") || ""
    setSelectedCategory(category)
    setSelectedSubcategory(subcategory || null)
    setSearchQuery(search)
  }, [searchParams])

  useEffect(() => {
    if (selectedCategory !== "soins") {
      setHasDismissedSoinsModal(false)
    }
  }, [selectedCategory])

  useEffect(() => {
    const fetchProducts = async () => {
      setIsRefetching(true)
      try {
        const filters: SearchFilters = {
          minPrice: priceRange[0],
          maxPrice: priceRange[1],
        }

        if (selectedCategory !== "all") filters.category = selectedCategory
        if (selectedSubcategory) filters.subcategory = selectedSubcategory
        if (selectedSkinTypes.length > 0) filters.skinType = selectedSkinTypes
        if (selectedHairTypes.length > 0) filters.hairType = selectedHairTypes

        if (sortBy !== "featured") {
          filters.sortBy = sortBy as any
        }

        const productsData = await searchProducts(searchQuery, filters)
        setProducts(productsData)
      } catch (error) {
        console.error("Error fetching products:", error)
      } finally {
        setIsInitialLoading(false)
        setIsRefetching(false)
      }
    }

    const debounce = setTimeout(fetchProducts, 300)
    return () => clearTimeout(debounce)
  }, [selectedCategory, selectedSubcategory, selectedSkinTypes, selectedHairTypes, priceRange, sortBy, searchQuery])

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId)
    setSelectedSubcategory(null)
    setSelectedSkinTypes([])
    setSelectedHairTypes([])

    const params = new URLSearchParams(searchParams.toString())
    if (categoryId === "all") {
      params.delete("category")
    } else {
      params.set("category", categoryId)
    }
    params.delete("subcategory")
    router.push(`/shop?${params.toString()}`)
  }

  const handleSubcategoryChange = (subcategoryId: string) => {
    if (selectedSubcategory === subcategoryId) {
      setSelectedSubcategory(null)
      const params = new URLSearchParams(searchParams.toString())
      params.delete("subcategory")
      router.push(`/shop?${params.toString()}`)
    } else {
      setSelectedSubcategory(subcategoryId)
      const params = new URLSearchParams(searchParams.toString())
      params.set("subcategory", subcategoryId)
      router.push(`/shop?${params.toString()}`)
    }
  }

  const toggleSkinType = (type: string) => {
    setSelectedSkinTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    )
  }

  const toggleHairType = (type: string) => {
    setSelectedHairTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    )
  }

  const clearAllFilters = () => {
    setSelectedCategory("all")
    setSelectedSubcategory(null)
    setSelectedSkinTypes([])
    setSelectedHairTypes([])
    setPriceRange([0, 200])
  }

  const activeFiltersCount =
    (selectedCategory !== "all" ? 1 : 0) +
    (selectedSubcategory ? 1 : 0) +
    selectedSkinTypes.length +
    selectedHairTypes.length +
    (priceRange[0] !== 0 || priceRange[1] !== 200 ? 1 : 0)

  const activeCategory = SHOP_CATEGORIES.find(c => c.id === selectedCategory)

  const toggleFilterExpand = (filterId: string) => {
    setExpandedFilters(prev =>
      prev.includes(filterId) ? prev.filter(f => f !== filterId) : [...prev, filterId]
    )
  }

  const filterProps = {
    selectedCategory,
    handleCategoryChange,
    selectedSubcategory,
    handleSubcategoryChange,
    selectedSkinTypes,
    toggleSkinType,
    selectedHairTypes,
    toggleHairType,
    priceRange,
    setPriceRange,
    expandedFilters,
    toggleFilterExpand
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 lg:px-6 xl:px-8 py-8">

        {/* Featured Section (New) */}
        <FeaturedSection />

        {/* Header & Controls */}
        <div id="product-section" className="scroll-mt-24">
          <ShopHeader
            title={selectedCategory === "all" ? "Tous les produits" : activeCategory?.label || "Boutique"}
            productCount={products.length}
            sortBy={sortBy}
            setSortBy={setSortBy}
            activeFiltersCount={activeFiltersCount}
            clearAllFilters={clearAllFilters}
            isFilterOpen={isFilterOpen}
            setIsFilterOpen={setIsFilterOpen}
            filterProps={filterProps}
          />
        </div>

        <div className="flex gap-8 lg:gap-12 mt-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <ShopFilters {...filterProps} />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            <div className={cn("transition-opacity duration-300", isRefetching ? "opacity-50" : "opacity-100")}>
              <ProductGrid
                products={products}
                loading={isInitialLoading}
                clearAllFilters={clearAllFilters}
              />
            </div>
          </div>
        </div>

        {/* Soins Subcategory Selection Modal */}
        <Dialog
          open={selectedCategory === "soins" && !selectedSubcategory && !hasDismissedSoinsModal}
          onOpenChange={(open) => {
            if (!open) {
              setHasDismissedSoinsModal(true)
            }
          }}
        >
          <DialogContent className="sm:max-w-[600px]">
            <DialogTitle className="text-center text-2xl font-bold mb-6">
              Que recherchez-vous ?
            </DialogTitle>
            <DialogDescription className="sr-only">
              Sélectionnez le type de soins que vous recherchez : visage, corps ou cheveux.
            </DialogDescription>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={(e) => {
                  e.currentTarget.blur()
                  setHasDismissedSoinsModal(true)
                  requestAnimationFrame(() => {
                    setTimeout(() => handleSubcategoryChange("visage"), 250)
                  })
                }}
                className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all duration-300 group"
                type="button"
              >
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <span className="font-semibold text-lg">Visage</span>
              </button>
              <button
                onClick={(e) => {
                  e.currentTarget.blur()
                  setHasDismissedSoinsModal(true)
                  requestAnimationFrame(() => {
                    setTimeout(() => handleSubcategoryChange("corps"), 250)
                  })
                }}
                className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all duration-300 group"
                type="button"
              >
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <span className="font-semibold text-lg">Corps</span>
              </button>
              <button
                onClick={(e) => {
                  e.currentTarget.blur()
                  setHasDismissedSoinsModal(true)
                  requestAnimationFrame(() => {
                    setTimeout(() => handleSubcategoryChange("cheveux"), 250)
                  })
                }}
                className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all duration-300 group"
                type="button"
              >
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Wind className="w-8 h-8 text-primary" />
                </div>
                <span className="font-semibold text-lg">Cheveux</span>
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 lg:px-6 xl:px-8 py-8">
          <div className="h-[400px] w-full bg-muted animate-pulse rounded-2xl mb-16" />
          <div className="mb-8 lg:mb-12 space-y-2">
            <div className="h-10 w-64 bg-muted animate-pulse" />
            <div className="h-4 w-32 bg-muted animate-pulse" />
          </div>
          <div className="flex gap-8 lg:gap-12">
            <aside className="hidden lg:block w-64 flex-shrink-0 space-y-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className="h-6 w-full bg-muted animate-pulse" />
                  <div className="space-y-2">
                    {[...Array(3)].map((_, j) => (
                      <div key={j} className="h-4 w-3/4 bg-muted animate-pulse" />
                    ))}
                  </div>
                </div>
              ))}
            </aside>
            <div className="flex-1">
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8 lg:gap-x-6 lg:gap-y-12">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="space-y-3 animate-pulse">
                    <div className="aspect-[3/4] bg-muted" />
                    <div className="h-3 bg-muted w-3/4" />
                    <div className="h-3 bg-muted w-1/2" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    }>
      <ShopContent />
    </Suspense>
  )
}