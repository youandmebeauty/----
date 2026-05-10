"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Collapse } from "@/components/ui/collapse"
import { SHOP_CATEGORIES } from "@/lib/category-data"
import { cn } from "@/lib/utils/utils"
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

    const sectionSpacing = isMobile ? "space-y-5" : "space-y-8"
    const sectionTitleClass = isMobile
        ? "text-[11px] font-semibold uppercase tracking-[0.22em] text-foreground"
        : "text-sm font-semibold uppercase tracking-widest text-foreground"
    const sectionHeaderClass = isMobile
        ? "flex items-center justify-between w-full mb-4 group"
        : "flex items-center justify-between w-full mb-6 group"
    const optionLabelClass = isMobile
        ? "flex items-center gap-3 cursor-pointer group rounded-xl border border-border/40 bg-background/60 px-3 py-3"
        : "flex items-center gap-3 cursor-pointer group"
    const categoryButtonClass = (isActive: boolean) =>
        cn(
            "flex items-center justify-center rounded-xl border px-3 py-3 text-sm font-medium transition-all duration-200",
            isMobile ? "min-h-12" : "min-h-11",
            isActive
                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                : "border-border/50 bg-background/60 text-muted-foreground hover:border-primary hover:text-foreground"
        )

    return (
        <div className={sectionSpacing}>
            {/* Categories */}
            <div className="block md:hidden space-y-4">
                <div className={sectionHeaderClass}>
                    <div className="flex items-center gap-3">
                        <span className="h-px w-8 bg-primary"></span>
                        <span className={sectionTitleClass}>Catégories</span>
                    </div>
                </div>
                <div className={isMobile ? "grid grid-cols-2 gap-2" : "flex flex-wrap gap-2"}>
                    <button
                        type="button"
                        onClick={() => handleCategoryChange("all")}
                        className={categoryButtonClass(selectedCategory === "all")}
                    >
                        Tous
                    </button>
                    {SHOP_CATEGORIES.map((category) => (
                        <button
                            key={category.id}
                            type="button"
                            onClick={() => handleCategoryChange(category.id)}
                            className={categoryButtonClass(selectedCategory === category.id)}
                        >
                            {category.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Subcategories */}
            {activeCategory?.subcategories && activeCategory.subcategories.length > 0 && (
                <div>
                    <button
                        onClick={() => handleToggleFilterExpand('subcategory')}
                        className={sectionHeaderClass}
                    >
                        <div className="flex items-center gap-3">
                            <span className="h-px w-8 bg-primary"></span>
                            <span className={sectionTitleClass}>
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
                    <Collapse isOpen={expandedFilters.includes("subcategory")} className={isMobile ? "space-y-2" : "space-y-3"}>
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
                                                    className={cn(
                                                        "flex items-center gap-2 w-full group/btn text-left",
                                                        isMobile ? "rounded-xl border border-border/40 bg-background/60 px-3 py-3" : "py-2"
                                                    )}
                                                >
                                                    <div
                                                        className={cn(
                                                            "transition-transform duration-200",
                                                            isExpanded && "rotate-90"
                                                        )}
                                                    >
                                                        <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground transition-colors group-hover/btn:text-foreground" />
                                                    </div>
                                                    <span className={cn(
                                                        "text-sm text-muted-foreground group-hover/btn:text-foreground transition-colors",
                                                        isMobile && "font-medium"
                                                    )}>
                                                        {sub.label}
                                                    </span>
                                                </button>
                                            ) : (
                                                <label className={optionLabelClass}>
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
                                                isOpen={!!(hasChildren && isExpanded)}
                                                className={cn("ml-6 border-l border-border", isMobile ? "space-y-2 pl-3" : "space-y-2 pl-4")}
                                            >
                                                {sub.subcategories?.map((child) => {
                                                    const isChildSelected = selectedSubcategory === child.id
                                                    return (
                                                        <label
                                                            key={child.id} 
                                                            className={cn(
                                                                "flex items-center gap-3 cursor-pointer group/child",
                                                                isMobile && "rounded-xl border border-border/40 bg-background/60 px-3 py-3"
                                                            )}
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
                            className={sectionHeaderClass}
                        >
                            <div className="flex items-center gap-3">
                                <span className="h-px w-8 bg-primary"></span>
                                <span className={sectionTitleClass}>
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
                        <Collapse isOpen={expandedFilters.includes(filter.id)} className={isMobile ? "space-y-2" : "space-y-3"}>
                                    {filter.options.map((option) => {
                                        const isChecked = filter.id === "skinType" 
                                            ? selectedSkinTypes.includes(option)
                                            : filter.id === "hairType" 
                                                ? selectedHairTypes.includes(option) 
                                                : false

                                        return (
                                            <label 
                                                key={option} 
                                                className={optionLabelClass}
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
                    className={sectionHeaderClass}
                >
                    <div className="flex items-center gap-3">
                        <span className="h-px w-8 bg-primary"></span>
                        <span className={sectionTitleClass}>
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
                <Collapse isOpen={expandedFilters.includes("price")} className={isMobile ? "space-y-4" : "space-y-6"}>
                            <div className={cn(isMobile && "rounded-2xl border border-border/40 bg-background/60 p-4") }>
                            <Slider
                                defaultValue={priceRange}
                                onValueChange={setPriceRange}
                                max={1000}
                                step={5}
                                className={cn("w-full", isMobile ? "py-2" : "py-4")}
                                aria-label="Prix"
                            />
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">{priceRange[0]} DT</span>
                                <span className="text-muted-foreground">{priceRange[1]} DT</span>
                            </div>
                            </div>
                </Collapse>
            </div>
        </div>
    )
}