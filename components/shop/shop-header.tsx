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

interface ShopHeaderProps {
    title: string
    productCount: number
    sortBy: string
    setSortBy: (value: string) => void
    activeFiltersCount: number
    clearAllFilters: () => void
    isFilterOpen: boolean
    setIsFilterOpen: (open: boolean) => void
    filterProps: any // Passing through props for the mobile filter sheet
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
        <div className="space-y-6">
            {/* Title Section */}
            <div className="mb-8 lg:mb-12">
                <h1 className="text-3xl lg:text-4xl font-light mb-2">
                    {title}
                </h1>
                <p className="text-sm text-muted-foreground">
                    {productCount} {productCount === 1 ? 'résultat' : 'résultats'}
                </p>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
                <SearchBar className="w-full" />
            </div>

            {/* Controls Section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b">

                {/* Mobile Filter Trigger */}
                <div className="lg:hidden">
                    <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="sm" className="font-medium w-full sm:w-auto">
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
                                    <h2 className="text-lg font-medium">Filtres</h2>
                                    {activeFiltersCount > 0 && (
                                        <button
                                            onClick={clearAllFilters}
                                            className="text-sm underline"
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
                                        className="w-full bg-foreground text-background hover:bg-foreground/90"
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
                <div className="hidden lg:flex items-center gap-2 text-sm">
                    {activeFiltersCount > 0 && (
                        <button
                            onClick={clearAllFilters}
                            className="underline hover:text-foreground transition-colors"
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