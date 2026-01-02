"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Collapse } from "@/components/ui/collapse"
import { SHOP_CATEGORIES } from "@/lib/category-data"
import { cn } from "@/lib/utils"
interface ShopFiltersProps {
    isMobile?: boolean
    selectedCategory: string
    handleCategoryChange: (id: string) => void
    selectedSubcategory: string | null
    handleSubcategoryChange: (id: string) => void
    selectedSkinTypes: string[]
    toggleSkinType: (type: string) => void
    selectedHairTypes: string[]
    toggleHairType: (type: string) => void
    priceRange: number[]
    setPriceRange: (range: number[]) => void
    expandedFilters?: string[]
    toggleFilterExpand?: (id: string) => void
}

export function ShopFilters({
    isMobile = false,
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
    expandedFilters: expandedFiltersProp,
    toggleFilterExpand
}: ShopFiltersProps) {
    const activeCategory = SHOP_CATEGORIES.find(c => c.id === selectedCategory)
    const [expandedSubcats, setExpandedSubcats] = useState<string[]>([])
    const [expandedFiltersLocal, setExpandedFiltersLocal] = useState<string[]>([
        "category",
        "subcategory",
        "price"
      ])
    
    const expandedFilters = expandedFiltersProp ?? expandedFiltersLocal
      
    const toggleSubcatExpand = (id: string) => {
        setExpandedSubcats(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        )
    }

    const handleToggleFilterExpand = (id: string) => {
        if (expandedFiltersProp && toggleFilterExpand) {
            toggleFilterExpand(id)
        } else {
            setExpandedFiltersLocal(prev =>
                prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
            )
        }
    }

    // Determine which filters to show based on subcategory
    const shouldShowSkinTypeFilter = () => {
        if (selectedCategory !== "soins") return false
        if (!selectedSubcategory) return true
        return selectedSubcategory === "visage" || selectedSubcategory === "corps"
    }

    const shouldShowHairTypeFilter = () => {
        if (selectedCategory !== "soins") return false
        if (!selectedSubcategory) return true
        return selectedSubcategory === "cheveux"
    }

    return (
        <div className="space-y-8">
            {/* Category Filter */}
            <div>
                <button
                    onClick={() => handleToggleFilterExpand('category')}
                    className="flex items-center justify-between w-full mb-6 group"
                >
                    <div className="flex items-center gap-3">
                        <span className="h-px w-8 bg-primary"></span>
                        <span className="text-sm font-semibold uppercase tracking-widest text-foreground">
                            Catégorie
                        </span>
                    </div>
                    <div
                        className={cn(
                            "transition-transform duration-200",
                            expandedFilters.includes("category") && "rotate-180"
                        )}
                    >
                        <ChevronDown className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" />
                    </div>
                </button>
                <Collapse isOpen={expandedFilters.includes("category")} className="space-y-3">
                            <label className="flex items-center py-2 cursor-pointer group">
                                <div className="relative flex items-center">
                                    <input
                                        type="radio"
                                        name={`${isMobile ? 'mobile' : 'desktop'}-category`}
                                        checked={selectedCategory === "all"}
                                        onChange={() => handleCategoryChange("all")}
                                        className="sr-only"
                                    />
                                    <div className={cn(
                                        "w-4 h-4 rounded-full flex items-center justify-center border-2 transition-all",
                                        selectedCategory === "all" 
                                            ? "border-primary" 
                                            : "border-border group-hover:border-foreground/30"
                                    )}>
                                        <div
                                            className={cn(
                                                "h-2 w-2 rounded-full bg-primary transition-transform duration-200",
                                                selectedCategory === "all" ? "scale-100" : "scale-0"
                                            )}
                                        />
                                    </div>
                                </div>
                                <span className={cn(
                                    "ml-3 text-sm transition-colors",
                                    selectedCategory === "all" 
                                        ? "text-foreground font-semibold" 
                                        : "text-muted-foreground group-hover:text-foreground"
                                )}>
                                    Tous les produits
                                </span>
                            </label>
                            {SHOP_CATEGORIES.map((category) => (
                                <label key={category.id} className="flex items-center py-2 cursor-pointer group">
                                    <div className="relative flex items-center">
                                        <input
                                            type="radio"
                                            name={`${isMobile ? 'mobile' : 'desktop'}-category`}
                                            checked={selectedCategory === category.id}
                                            onChange={() => handleCategoryChange(category.id)}
                                            className="sr-only"
                                        />
                                        <div className={cn(
                                            "w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all",
                                            selectedCategory === category.id 
                                                ? "border-primary" 
                                                : "border-border group-hover:border-foreground/30"
                                        )}>
                                            <div
                                                className={cn(
                                                    "h-2 w-2 rounded-full bg-primary transition-transform duration-200",
                                                    selectedCategory === category.id ? "scale-100" : "scale-0"
                                                )}
                                            />
                                        </div>
                                    </div>
                                    <span className={cn(
                                        "ml-3 text-sm transition-colors",
                                        selectedCategory === category.id 
                                            ? "text-foreground font-semibold" 
                                            : "text-muted-foreground group-hover:text-foreground"
                                    )}>
                                        {category.label}
                                    </span>
                                </label>
                            ))}
                </Collapse>
            </div>

            {/* Subcategories */}
            {activeCategory?.subcategories && activeCategory.subcategories.length > 0 && (
                <div>
                    <button
                        onClick={() => handleToggleFilterExpand('subcategory')}
                        className="flex items-center justify-between w-full mb-6 group"
                    >
                        <div className="flex items-center gap-3">
                            <span className="h-px w-8 bg-primary"></span>
                            <span className="text-sm font-semibold uppercase tracking-widest text-foreground">
                                Type
                            </span>
                        </div>
                        <div
                            className={cn(
                                "transition-transform duration-200",
                                expandedFilters.includes("subcategory") && "rotate-180"
                            )}
                        >
                            <ChevronDown className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" />
                        </div>
                    </button>
                    <Collapse isOpen={expandedFilters.includes("subcategory")} className="space-y-3">
                                {activeCategory.subcategories.map((sub) => {
                                    const hasChildren = sub.subcategories && sub.subcategories.length > 0
                                    const isExpanded = expandedSubcats.includes(sub.id)
                                    const isSelected = selectedSubcategory === sub.id

                                    return (
                                        <div key={sub.id} className="space-y-2">
                                            {hasChildren ? (
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        toggleSubcatExpand(sub.id);
                                                    }}
                                                    className="flex items-center gap-2 w-full py-2 group/btn"
                                                >
                                                    <div
                                                        className={cn(
                                                            "transition-transform duration-200",
                                                            isExpanded && "rotate-90"
                                                        )}
                                                    >
                                                        <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground transition-colors group-hover/btn:text-foreground" />
                                                    </div>
                                                    <span className="text-sm text-muted-foreground group-hover/btn:text-foreground transition-colors">
                                                        {sub.label}
                                                    </span>
                                                </button>
                                            ) : (
                                                <label className="flex items-center gap-3 cursor-pointer group">
                                                    <Checkbox
                                                        id={`${isMobile ? 'mobile' : 'desktop'}-sub-${sub.id}`}
                                                        checked={isSelected}
                                                        onCheckedChange={() => handleSubcategoryChange(sub.id)}
                                                        className="border-2 border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-all"
                                                    />
                                                    <span className={cn(
                                                        "text-sm transition-colors",
                                                        isSelected 
                                                            ? "text-foreground font-semibold" 
                                                            : "text-muted-foreground group-hover:text-foreground"
                                                    )}>
                                                        {sub.label}
                                                    </span>
                                                </label>
                                            )}
                                            {/* Nested Subcategories */}
                                            <Collapse
                                                isOpen={hasChildren && isExpanded}
                                                className="ml-6 space-y-2 border-l border-border pl-4"
                                            >
                                                {sub.subcategories?.map((child) => {
                                                    const isChildSelected = selectedSubcategory === child.id
                                                    return (
                                                        <label 
                                                            key={child.id} 
                                                            className="flex items-center gap-3 cursor-pointer group/child"
                                                        >
                                                            <Checkbox
                                                                id={`${isMobile ? 'mobile' : 'desktop'}-sub-${child.id}`}
                                                                checked={isChildSelected}
                                                                onCheckedChange={() => handleSubcategoryChange(child.id)}
                                                                className="w-3.5 h-3.5 border-2 border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-all"
                                                            />
                                                            <span className={cn(
                                                                "text-sm transition-colors",
                                                                isChildSelected 
                                                                    ? "text-foreground font-semibold" 
                                                                    : "text-muted-foreground group-hover/child:text-foreground"
                                                            )}>
                                                                {child.label}
                                                            </span>
                                                        </label>
                                                    )
                                                })}
                                            </Collapse>
                                        </div>
                                    )
                                })}
                    </Collapse>
                </div>
            )}

            {/* Dynamic Filters - Conditionally rendered */}
            {activeCategory?.filters?.map((filter) => {
                if (filter.id === "skinType" && !shouldShowSkinTypeFilter()) return null
                if (filter.id === "hairType" && !shouldShowHairTypeFilter()) return null

                return (
                    <div key={filter.id}>
                        <button
                            onClick={() => handleToggleFilterExpand(filter.id)}
                            className="flex items-center justify-between w-full mb-6 group"
                        >
                            <div className="flex items-center gap-3">
                                <span className="h-px w-8 bg-primary"></span>
                                <span className="text-sm font-semibold uppercase tracking-widest text-foreground">
                                    {filter.label}
                                </span>
                            </div>
                            <div
                                className={cn(
                                    "transition-transform duration-200",
                                    expandedFilters.includes(filter.id) && "rotate-180"
                                )}
                            >
                                <ChevronDown className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" />
                            </div>
                        </button>
                        <Collapse isOpen={expandedFilters.includes(filter.id)} className="space-y-3">
                                    {filter.options.map((option) => {
                                        const isChecked = filter.id === "skinType" 
                                            ? selectedSkinTypes.includes(option)
                                            : filter.id === "hairType" 
                                                ? selectedHairTypes.includes(option) 
                                                : false

                                        return (
                                            <label 
                                                key={option} 
                                                className="flex items-center gap-3 cursor-pointer group"
                                            >
                                                <Checkbox
                                                    id={`${isMobile ? 'mobile' : 'desktop'}-${filter.id}-${option}`}
                                                    checked={isChecked}
                                                    onCheckedChange={() => {
                                                        if (filter.id === "skinType") toggleSkinType(option)
                                                        if (filter.id === "hairType") toggleHairType(option)
                                                    }}
                                                    className="border-2 border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-all"
                                                />
                                                <span className={cn(
                                                    "text-sm transition-colors",
                                                    isChecked 
                                                        ? "text-foreground font-semibold" 
                                                        : "text-muted-foreground group-hover:text-foreground"
                                                )}>
                                                    {option}
                                                </span>
                                            </label>
                                        )
                                    })}
                        </Collapse>
                    </div>
                )
            })}

            {/* Price Range */}
            <div>
                <button
                    onClick={() => handleToggleFilterExpand('price')}
                    className="flex items-center justify-between w-full mb-6 group"
                >
                    <div className="flex items-center gap-3">
                        <span className="h-px w-8 bg-primary"></span>
                        <span className="text-sm font-semibold uppercase tracking-widest text-foreground">
                            Prix
                        </span>
                    </div>
                    <div
                        className={cn(
                            "transition-transform duration-200",
                            expandedFilters.includes("price") && "rotate-180"
                        )}
                    >
                        <ChevronDown className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" />
                    </div>
                </button>
                <Collapse isOpen={expandedFilters.includes("price")} className="space-y-6">
                            <Slider
                                defaultValue={priceRange}
                                onValueChange={setPriceRange}
                                max={1000}
                                step={5}
                                className={cn("w-full", "py-4")}
                                aria-label="Prix"
                            />
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">{priceRange[0]} DT</span>
                                <span className="text-muted-foreground">{priceRange[1]} DT</span>
                            </div>
                </Collapse>
            </div>
        </div>
    )
}