"use client"

import { Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { ShopFilters } from "./shop-filters"
import { SearchBar } from "@/components/navigation/search-bar"
import { SHOP_CATEGORIES } from "@/lib/category-data"
import { cn } from "@/lib/utils/utils"

interface ShopHeaderProps {
    title: string
    productCount: number
    sortBy: string
    setSortBy: (value: string) => void
    activeFiltersCount: number
    clearAllFilters: () => void
    isFilterOpen: boolean
    setIsFilterOpen: (open: boolean) => void
    filterProps: any
}

export function ShopHeader({
    title,
    productCount,
    sortBy,
    setSortBy,
    activeFiltersCount,
    clearAllFilters,
    isFilterOpen,
    setIsFilterOpen,
    filterProps
}: ShopHeaderProps) {
    const selectedCategoryLabel = SHOP_CATEGORIES.find(
        (category: any) => category.id === filterProps.selectedCategory
    )?.label

    const activeFilterSummary = [
        filterProps.selectedCategory !== "all" ? selectedCategoryLabel : null,
        filterProps.selectedSubcategory,
        filterProps.selectedSkinTypes?.length ? `${filterProps.selectedSkinTypes.length} type${filterProps.selectedSkinTypes.length > 1 ? "s" : ""} de peau` : null,
        filterProps.selectedHairTypes?.length ? `${filterProps.selectedHairTypes.length} type${filterProps.selectedHairTypes.length > 1 ? "s" : ""} de cheveux` : null,
        filterProps.priceRange?.[0] !== 0 || filterProps.priceRange?.[1] !== 1000
            ? `${filterProps.priceRange?.[0] ?? 0} - ${filterProps.priceRange?.[1] ?? 1000} DT`
            : null,
    ].filter(Boolean)

    return (
        <div className="space-y-4 sm:space-y-5 lg:space-y-6">
            {/* Title and Result Count */}
            <div className="flex items-baseline justify-between gap-3 sm:gap-4 flex-wrap">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
                    {title}
                </h1>
                <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                    {productCount} {productCount === 1 ? 'produit' : 'produits'}
                </span>
            </div>

            {/* Search Bar */}
            <SearchBar className="w-full" />

            {/* Elegant Category Filter */}
            <div className="relative border-y border-border/30 -mx-4 px-4 lg:-mx-6 lg:px-6 xl:-mx-8 xl:px-8 py-6">
                {/* Left scroll shadow */}
                <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none z-10" />
                {/* Right scroll shadow */}
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />
                
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-0.5">
                    <button
                        onClick={() => filterProps.handleCategoryChange("all")}
                        className={cn(
                            "flex-shrink-0 px-8 py-2 text-[13px]  uppercase transition-all duration-200 border whitespace-nowrap",
                            filterProps.selectedCategory === "all"
                                ? "bg-primary text-primary-foreground border-primary rounded-md"
                                : "bg-transparent text-muted-foreground border-border/50 rounded-md hover:border-primary hover:text-foreground"
                        )}
                    >
                        Tous les produits
                    </button>

                    {filterProps.selectedCategory === "all" && (
                        <div className="h-6 w-[1px] bg-border/40 flex-shrink-0 mx-1" />
                    )}

                    {SHOP_CATEGORIES.map((category: any) => (
                        <button
                            key={category.id}
                            onClick={() => filterProps.handleCategoryChange(category.id)}
                            className={cn(
                                "flex-shrink-0 px-8 py-2 text-[13px]  uppercase whitespace-nowrap transition-all duration-200 border",
                                filterProps.selectedCategory === category.id
                                    ? "bg-primary text-primary-foreground border-primary rounded-md"
                                    : "bg-transparent text-muted-foreground border-border/50 hover:border-primary hover:text-foreground rounded-md"
                            )}
                        >
                            {category.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

                {/* Mobile Filter Trigger */}
                <div className="lg:hidden">
                    <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                        <SheetTrigger asChild>
                            <Button variant="outline" className="font-medium w-full sm:w-auto gap-2">
                                <Filter className="w-4 h-4 mr-2" />
                                Filtres
                                {activeFiltersCount > 0 && ` (${activeFiltersCount})`}
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-full sm:w-80 p-0 flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden">
                            <SheetTitle className="sr-only">Filtres de produits</SheetTitle>
                            <SheetDescription className="sr-only">
                                Filtrez les produits par catégorie, type de peau, type de cheveux et prix
                            </SheetDescription>
                            <div className="relative grid flex-1 min-h-0 grid-rows-[auto_minmax(0,1fr)_auto] pt-10">
                                <div className="sticky top-0 z-10 border-b px-5 py-4 sm:px-6 sm:py-5 space-y-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <h2 className="text-lg sm:text-xl font-semibold leading-none">Filtres</h2>
                                            <p className="mt-2 text-sm text-muted-foreground">
                                                Affinez la liste avec de gros contrôles tactiles.
                                            </p>
                                        </div>
                                    </div>

                                    {activeFiltersCount > 0 && (
                                        <button
                                            onClick={clearAllFilters}
                                            className="absolute right-5 top-12 text-sm font-medium underline underline-offset-4 hover:no-underline transition-all whitespace-nowrap"
                                        >
                                            Effacer tout
                                        </button>
                                    )}

                                    {activeFilterSummary.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {activeFilterSummary.map((item) => (
                                                <span
                                                    key={item}
                                                    className="inline-flex items-center rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-xs font-medium text-foreground"
                                                >
                                                    {item}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="min-h-0 overflow-y-auto px-5 py-4 sm:px-6 sm:py-5 overscroll-contain" data-lenis-prevent data-lenis-prevent-wheel data-lenis-prevent-touch>
                                    <ShopFilters isMobile {...filterProps} />
                                </div>
                                <div className="sticky bottom-0 z-10 border-t p-4 sm:p-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
                                    <Button
                                        className="w-full bg-foreground text-background hover:bg-foreground/90 font-medium h-12"
                                        onClick={() => setIsFilterOpen(false)}
                                    >
                                        Voir {productCount} produits
                                    </Button>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>

                {/* Desktop Active Filters Clear */}
                <div className="hidden lg:flex items-center">
                    {activeFiltersCount > 0 && (
                        <button
                            onClick={clearAllFilters}
                            className="text-sm font-medium underline hover:no-underline transition-all"
                        >
                            Effacer les filtres ({activeFiltersCount})
                        </button>
                    )}
                </div>

                {/* Sort Dropdown */}
                <div className="flex items-center justify-end">
                    <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-[200px] border-none shadow-none focus:ring-0 text-sm font-medium">
                            <SelectValue placeholder="Trier par" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="newest">Nouveautés</SelectItem>
                            <SelectItem value="featured">En vedette</SelectItem>
                            <SelectItem value="price-asc">Prix croissant</SelectItem>
                            <SelectItem value="price-desc">Prix décroissant</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    )
}