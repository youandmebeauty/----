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
import { SearchBar } from "@/components/search-bar"
import { SHOP_CATEGORIES } from "@/lib/category-data"
import { cn } from "@/lib/utils"

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
                            "flex-shrink-0 px-8 py-2 text-[13px] font-light tracking-[0.08em] uppercase transition-all duration-200 border whitespace-nowrap",
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
                                "flex-shrink-0 px-8 py-2 text-[13px] font-light tracking-[0.08em] uppercase whitespace-nowrap transition-all duration-200 border",
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
                            <Button variant="outline" className="font-medium w-full sm:w-auto">
                                <Filter className="w-4 h-4 mr-2" />
                                Filtres
                                {activeFiltersCount > 0 && ` (${activeFiltersCount})`}
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-full sm:w-80 p-0">
                            <SheetTitle className="sr-only">Filtres de produits</SheetTitle>
                            <SheetDescription className="sr-only">
                                Filtrez les produits par catégorie, type de peau, type de cheveux et prix
                            </SheetDescription>
                            <div className="flex flex-col h-full">
                                <div className="px-6 py-4 border-b flex items-center justify-between">
                                    <h2 className="text-lg font-semibold">Filtres</h2>
                                    {activeFiltersCount > 0 && (
                                        <button
                                            onClick={clearAllFilters}
                                            className="text-sm font-medium underline hover:no-underline transition-all"
                                        >
                                            Effacer tout
                                        </button>
                                    )}
                                </div>
                                <div className="flex-1 overflow-y-auto px-6">
                                    <ShopFilters isMobile {...filterProps} />
                                </div>
                                <div className="p-6 border-t">
                                    <Button
                                        className="w-full bg-foreground text-background hover:bg-foreground/90 font-medium"
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
                            <SelectItem value="featured">En vedette</SelectItem>
                            <SelectItem value="price-asc">Prix croissant</SelectItem>
                            <SelectItem value="price-desc">Prix décroissant</SelectItem>
                            <SelectItem value="newest">Nouveautés</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    )
}