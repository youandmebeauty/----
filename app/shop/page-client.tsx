"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { searchProducts } from "@/lib/services/product-service"
import type { Product, SearchFilters } from "@/lib/models"
import { SHOP_CATEGORIES } from "@/lib/category-data"
import { Sparkles, User, Wind, Pill } from "lucide-react"

// Components
import { ShopHeader } from "@/components/shop/shop-header"
import { ShopFilters } from "@/components/shop/shop-filters"
import { ProductGrid } from "@/components/shop/product-grid"
import { Breadcrumb } from "@/components/breadcrumb"
import { cn } from "@/lib/utils"
import { ScrollAnimation } from "@/components/scroll-animation"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { FeaturedSection } from "@/components/shop/featured-section"
import { LoadingAnimation } from "@/components/ui/loading-animation"

function SearchContent() {
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
  const [priceRange, setPriceRange] = useState([0, 1000])
  const [sortBy, setSortBy] = useState("newest")
  const [searchQuery, setSearchQuery] = useState("")
  const [isNavigating, setIsNavigating] = useState(false)
  useEffect(() => {
    // In search page, we prioritize 'q' for the query
    const category = searchParams.get("category") || "all"
    const subcategory = searchParams.get("subcategory")
    const search = searchParams.get("q") || searchParams.get("shop") || ""
    const sort = searchParams.get("sort") || "newest"

    setSelectedCategory(category)
    setSelectedSubcategory(subcategory || null)
    setSearchQuery(search)
    setSortBy(sort)
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

    const params = new URLSearchParams() // Start fresh to avoid accumulation of unwanted params? Or preserve?
    // Let's behave similarly to ShopPage but keep 'q'

    // Actually, ShopPage does: new URLSearchParams(searchParams.toString())
    const paramsCurrent = new URLSearchParams(searchParams.toString())

    if (categoryId === "all") {
      paramsCurrent.delete("category")
    } else {
      paramsCurrent.set("category", categoryId)
    }
    paramsCurrent.delete("subcategory")

    // Preserve sortBy in URL
    if (sortBy && sortBy !== "featured") {
      paramsCurrent.set("sort", sortBy)
    }

    // Ensure q is preserved (it should be since we extended searchParams)

    router.replace(`/shop?${paramsCurrent.toString()}`, { scroll: false })
  }

  const handleSubcategoryChange = (subcategoryId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (selectedSubcategory === subcategoryId) {
      setSelectedSubcategory(null)
      params.delete("subcategory")
    } else {
      setSelectedSubcategory(subcategoryId)
      params.set("subcategory", subcategoryId)
    }
    router.replace(`/shop?${params.toString()}`, { scroll: false })
  }

  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy)
    const params = new URLSearchParams(searchParams.toString())
    if (newSortBy && newSortBy !== "featured") {
      params.set("sort", newSortBy)
    } else {
      params.delete("sort")
    }
    router.replace(`/shop?${params.toString()}`, { scroll: false })
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
    setPriceRange([0, 1000])
    setSortBy("featured")

    // Clear all URL parameters
    router.replace('/shop', { scroll: false })
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
  const categories = [
    { id: 'visage', icon: Sparkles, label: 'Visage' },
    { id: 'corps', icon: User, label: 'Corps' },
    { id: 'cheveux', icon: Wind, label: 'Cheveux' },
    { id: 'complement-nutritionnel', icon: Pill, label: 'Compléments' }
  ];

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

  // Determine title based on search query
  const pageTitle = searchQuery
    ? `Résultats pour "${searchQuery}"`
    : (selectedCategory === "all" ? "Tous les produits" : activeCategory?.label || "Recherche")

  // Group products by category for organized display
  const productsByCategory = products.reduce((acc, product) => {
    const categoryId = product.category
    if (!acc[categoryId]) {
      const categoryData = SHOP_CATEGORIES.find(c => c.id === categoryId)
      acc[categoryId] = {
        id: categoryId,
        label: categoryData?.label || categoryId,
        products: []
      }
    }
    acc[categoryId].products.push(product)
    return acc
  }, {} as Record<string, { id: string; label: string; products: Product[] }>)

  const categoryGroups = Object.values(productsByCategory)
  const showCategoryDivision = selectedCategory === "all" && !searchQuery && categoryGroups.length > 1

  if (isNavigating) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
        <LoadingAnimation size={140} className="text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background ">
      <main className="container mx-auto  px-4 lg:px-6 xl:px-8 py-8">
        {/* Breadcrumb */}
        <ScrollAnimation variant="slideUp" className="mb-6">
          <Breadcrumb
            items={[{ name: "Boutique", href: "/shop", current: true }]}
          />
        </ScrollAnimation>

        {/* Featured Section (New) */}
        <ScrollAnimation variant="blurRise" className="mb-12">
          <FeaturedSection />
        </ScrollAnimation>

        
        {/* Header & Controls */}
        <ScrollAnimation
          variant="flipUp"
          perspective={1200}
          ease="expo.out"
          className="mb-6"
        >
          <div id="product-section" className="scroll-mt-24">
            <ShopHeader
              title={pageTitle}
              productCount={products.length}
              sortBy={sortBy}
              setSortBy={handleSortChange}
              activeFiltersCount={activeFiltersCount}
              clearAllFilters={clearAllFilters}
              isFilterOpen={isFilterOpen}
              setIsFilterOpen={setIsFilterOpen}
              filterProps={filterProps}
            />
          </div>
        </ScrollAnimation>

        <ScrollAnimation
          variant="slideUp"
          stagger={0.16}
          childSelector=".shop-layout-pane"
          className="mt-8 flex gap-8 lg:gap-12"
        >
          {/* Desktop Sidebar */}
          <aside className="shop-layout-pane hidden w-64 flex-shrink-0 lg:block">
            <ScrollAnimation
              variant="slideUp"
              start="top 85%"
              end="bottom top"
            >
              <div className="sticky top-24">
                <ShopFilters {...filterProps} />
              </div>
            </ScrollAnimation>
          </aside>

          {/* Main Content */}
          <div className="shop-layout-pane flex-1">
            <div className={cn("transition-opacity duration-300", isRefetching ? "opacity-50" : "opacity-100")}>
              {products.length === 0 && !isInitialLoading ? (
                <ScrollAnimation variant="fadeIn">
                  <div className="py-12 text-center">
                    <p className="mb-4 text-lg text-muted-foreground">Aucun produit trouvé pour votre recherche.</p>
                    <button onClick={clearAllFilters} className="text-primary hover:underline">
                      Effacer les filtres
                    </button>
                  </div>
                </ScrollAnimation>
              ) : showCategoryDivision ? (
                <div className="space-y-20">
                  {categoryGroups.map((categoryGroup, index) => (
                    <ScrollAnimation key={categoryGroup.id} variant="blurRise" childSelector=".product-grid-item" stagger={0.08}>
                      <div id={`category-${categoryGroup.id}`} className="space-y-8 scroll-mt-28">
                        {/* Category Header */}
                        <div className="flex items-center justify-between">
                          <h2 className="text-2xl font-semibold tracking-tight">{categoryGroup.label}</h2>
                          <span className="text-sm text-muted-foreground">
                            {categoryGroup.products.length} {categoryGroup.products.length > 1 ? 'produits' : 'produit'}
                          </span>
                        </div>
                        
                        {/* Category Grid */}
                        <ProductGrid
                          products={categoryGroup.products}
                          loading={false}
                          clearAllFilters={clearAllFilters}
                          onProductNavigate={() => setIsNavigating(true)}
                          grouping="none"
                        />
                        
                        {/* Divider between categories */}
                        {index < categoryGroups.length - 1 && (
                          <div className="pt-12">
                            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                          </div>
                        )}
                      </div>
                    </ScrollAnimation>
                  ))}
                </div>
              ) : (
                <ScrollAnimation variant="blurRise" childSelector=".product-grid-item" stagger={0.08}>
                  <ProductGrid
                    products={products}
                    loading={isInitialLoading}
                    clearAllFilters={clearAllFilters}
                    onProductNavigate={() => setIsNavigating(true)}
                    grouping="none"
                  />
                </ScrollAnimation>
              )}
            </div>
          </div>
        </ScrollAnimation>

        {/* Soins Subcategory Selection Modal */}
        <Dialog
        open={selectedCategory === "soins" && !selectedSubcategory && !hasDismissedSoinsModal}
        onOpenChange={(open) => {
          if (!open) {
            setHasDismissedSoinsModal(true);
          }
        }}
      >
        <DialogContent className="w-full max-w-md bg-background rounded-xl shadow-xl p-5">
          <DialogTitle className="text-center text-xl font-bold mb-4">
            Que recherchez-vous ?
          </DialogTitle>
          <DialogDescription className="sr-only">
            Sélectionnez le type de soins que vous recherchez : visage, corps, cheveux ou compléments.
          </DialogDescription>
          
          <div className="grid grid-cols-2 gap-3">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={(e) => {
                    e.currentTarget.blur();
                    setHasDismissedSoinsModal(true);
                    requestAnimationFrame(() => {
                      setTimeout(() => handleSubcategoryChange(category.id), 250);
                    });
                  }}
                  className="flex flex-col items-center justify-center p-4 rounded-lg border-2 border-border hover:border-primary hover:bg-primary/10 transition-all duration-200 group"
                  type="button"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2 group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <span className="font-semibold text-sm">{category.label}</span>
                </button>
              );
            })}
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
      <SearchContent />
    </Suspense>
  )
}
