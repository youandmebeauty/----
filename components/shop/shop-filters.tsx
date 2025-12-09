"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Minus, ChevronDown, ChevronRight, Sparkles } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
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
    expandedFilters: string[]
    toggleFilterExpand: (id: string) => void
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
    toggleFilterExpand
}: ShopFiltersProps) {
    const activeCategory = SHOP_CATEGORIES.find(c => c.id === selectedCategory)
    const [expandedSubcats, setExpandedSubcats] = useState<string[]>([])
    const [expandedFilters, setExpandedFilters] = useState<string[]>([
        "category",
        "subcategory",
        "price"
      ])
      
    const toggleSubcatExpand = (id: string) => {
        setExpandedSubcats(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        )
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
        <div className="space-y-1">
            {/* Category Filter */}
            <div className="rounded-lg bg-card/50 border border-border/50 p-4 transition-all hover:border-border hover:shadow-sm">
                <button
                    onClick={() => toggleFilterExpand('category')}
                    className="flex items-center justify-between w-full mb-3 group"
                >
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary opacity-60 group-hover:opacity-100 transition-opacity" />
                        <span className="text-sm font-semibold uppercase tracking-wider text-foreground/90">
                            Catégorie
                        </span>
                    </div>
                    <motion.div
                        animate={{ rotate: expandedFilters.includes('category') ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        {expandedFilters.includes('category') ? (
                            <Minus className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                        ) : (
                            <Plus className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                        )}
                    </motion.div>
                </button>
                <AnimatePresence>
                    {expandedFilters.includes('category') && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                            className="space-y-1 overflow-hidden"
                        >
                            <label className={cn(
                                "flex items-center py-2.5 px-3 rounded-md cursor-pointer group transition-all",
                                "hover:bg-primary/5 hover:border-primary/20",
                                selectedCategory === "all" && "bg-primary/10 border border-primary/30"
                            )}>
                                <div className="relative flex items-center">
                                    <input
                                        type="radio"
                                        name={`${isMobile ? 'mobile' : 'desktop'}-category`}
                                        checked={selectedCategory === "all"}
                                        onChange={() => handleCategoryChange("all")}
                                        className="sr-only"
                                    />
                                    <div className={cn(
                                        "w-4 h-4 rounded-full  flex items-center justify-center border-2 transition-all",
                                        selectedCategory === "all" 
                                            ? "border-primary" 
                                            : "border-muted-foreground/40 group-hover:border-primary/50"
                                    )}>
                                        {selectedCategory === "all" && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="w-2 h-2 rounded-full bg-primary"
                                            />
                                        )}
                                    </div>
                                </div>
                                <span className={cn(
                                    "ml-3 text-sm font-medium transition-colors",
                                    selectedCategory === "all" 
                                        ? "text-primary font-semibold" 
                                        : "text-foreground/80 group-hover:text-foreground"
                                )}>
                                    Tous les produits
                                </span>
                            </label>
                            {SHOP_CATEGORIES.map((category) => (
                                <label key={category.id} className={cn(
                                    "flex items-center py-2.5 px-3 rounded-md cursor-pointer group transition-all",
                                    "hover:bg-primary/5 hover:border-primary/20",
                                    selectedCategory === category.id && "bg-primary/10 border border-primary/30"
                                )}>
                                    <div className="relative flex items-center">
                                        <input
                                            type="radio"
                                            name={`${isMobile ? 'mobile' : 'desktop'}-category`}
                                            checked={selectedCategory === category.id}
                                            onChange={() => handleCategoryChange(category.id)}
                                            className="sr-only "
                                        />
                                        <div className={cn(
  "w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all",
  selectedCategory === category.id 
    ? "border-primary" 
    : "border-muted-foreground/40 group-hover:border-primary/50"
)}>
  {selectedCategory === category.id && (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="w-2 h-2 rounded-full bg-primary"
    />
  )}
</div>

                                    </div>
                                    <span className={cn(
                                        "ml-3 text-sm font-medium transition-colors",
                                        selectedCategory === category.id 
                                            ? "text-primary font-semibold" 
                                            : "text-foreground/80 group-hover:text-foreground"
                                    )}>
                                        {category.label}
                                    </span>
                                </label>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Subcategories */}
            {activeCategory?.subcategories && activeCategory.subcategories.length > 0 && (
                <div className="rounded-lg bg-card/50 border border-border/50 p-4 transition-all hover:border-border hover:shadow-sm">
                    <button
                        onClick={() => toggleFilterExpand('subcategory')}
                        className="flex items-center justify-between w-full mb-3 group"
                    >
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-primary opacity-60 group-hover:opacity-100 transition-opacity" />
                            <span className="text-sm font-semibold uppercase tracking-wider text-foreground/90">
                                Type
                            </span>
                            {selectedSubcategory && (
                                <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-primary/20 text-primary rounded-full">
                                    1
                                </span>
                            )}
                        </div>
                        <motion.div
                            animate={{ rotate: expandedFilters.includes('subcategory') ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            {expandedFilters.includes('subcategory') ? (
                                <Minus className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                            ) : (
                                <Plus className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                            )}
                        </motion.div>
                    </button>
                    <AnimatePresence>
                        {expandedFilters.includes('subcategory') && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25, ease: "easeInOut" }}
                                className="space-y-1 overflow-hidden"
                            >
                                {activeCategory.subcategories.map((sub) => {
                                    const hasChildren = sub.subcategories && sub.subcategories.length > 0
                                    const isExpanded = expandedSubcats.includes(sub.id)
                                    const isSelected = selectedSubcategory === sub.id

                                    return (
                                        <div key={sub.id} className="space-y-1">
                                            <div className={cn(
                                                "flex items-center justify-between py-2.5 px-3 rounded-md group transition-all",
                                                "hover:bg-primary/5",
                                                isSelected && !hasChildren && "bg-primary/10 border border-primary/30"
                                            )}>
                                                <div className="flex items-center flex-1 min-w-0">
                                                    {hasChildren ? (
                                                        <button
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                toggleSubcatExpand(sub.id);
                                                            }}
                                                            className="flex items-center gap-2 flex-1 min-w-0 group/btn"
                                                        >
                                                            <motion.div
                                                                animate={{ rotate: isExpanded ? 90 : 0 }}
                                                                transition={{ duration: 0.2 }}
                                                            >
                                                                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover/btn:text-primary transition-colors flex-shrink-0" />
                                                            </motion.div>
                                                            <span className="text-sm font-medium text-foreground/80 group-hover/btn:text-foreground transition-colors truncate">
                                                                {sub.label}
                                                            </span>
                                                        </button>
                                                    ) : (
                                                        <label className="flex items-center gap-3 flex-1 cursor-pointer">
                                                            <Checkbox
                                                                id={`${isMobile ? 'mobile' : 'desktop'}-sub-${sub.id}`}
                                                                checked={isSelected}
                                                                onCheckedChange={() => handleSubcategoryChange(sub.id)}
                                                                className="border-2 border-muted-foreground/40 data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-all"
                                                            />
                                                            <span className={cn(
                                                                "text-sm font-medium transition-colors",
                                                                isSelected 
                                                                    ? "text-primary font-semibold" 
                                                                    : "text-foreground/80 group-hover:text-foreground"
                                                            )}>
                                                                {sub.label}
                                                            </span>
                                                        </label>
                                                    )}
                                                </div>
                                            </div>
                                            {/* Nested Subcategories */}
                                            <AnimatePresence>
                                                {hasChildren && isExpanded && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: "auto", opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.2 }}
                                                        className="ml-6 space-y-1 border-l-2 border-primary/20 pl-4 my-1 overflow-hidden"
                                                    >
                                                        {sub.subcategories!.map((child) => {
                                                            const isChildSelected = selectedSubcategory === child.id
                                                            return (
                                                                <label 
                                                                    key={child.id} 
                                                                    className={cn(
                                                                        "flex items-center gap-2 py-2 px-2 rounded-md cursor-pointer group/child transition-all",
                                                                        "hover:bg-primary/5",
                                                                        isChildSelected && "bg-primary/10"
                                                                    )}
                                                                >
                                                                    <Checkbox
                                                                        id={`${isMobile ? 'mobile' : 'desktop'}-sub-${child.id}`}
                                                                        checked={isChildSelected}
                                                                        onCheckedChange={() => handleSubcategoryChange(child.id)}
                                                                        className="w-3.5 h-3.5 border-2 border-muted-foreground/40 data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-all"
                                                                    />
                                                                    <span className={cn(
                                                                        "text-sm transition-colors",
                                                                        isChildSelected 
                                                                            ? "text-primary font-medium" 
                                                                            : "text-muted-foreground group-hover/child:text-foreground"
                                                                    )}>
                                                                        {child.label}
                                                                    </span>
                                                                </label>
                                                            )
                                                        })}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    )
                                })}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            {/* Dynamic Filters - Conditionally rendered */}
            {activeCategory?.filters?.map((filter) => {
                if (filter.id === "skinType" && !shouldShowSkinTypeFilter()) return null
                if (filter.id === "hairType" && !shouldShowHairTypeFilter()) return null

                const selectedCount = filter.id === "skinType" 
                    ? selectedSkinTypes.length 
                    : filter.id === "hairType" 
                        ? selectedHairTypes.length 
                        : 0

                return (
                    <div key={filter.id} className="rounded-lg bg-card/50 border border-border/50 p-4 transition-all hover:border-border hover:shadow-sm">
                        <button
                            onClick={() => toggleFilterExpand(filter.id)}
                            className="flex items-center justify-between w-full mb-3 group"
                        >
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-primary opacity-60 group-hover:opacity-100 transition-opacity" />
                                <span className="text-sm font-semibold uppercase tracking-wider text-foreground/90">
                                    {filter.label}
                                </span>
                                {selectedCount > 0 && (
                                    <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-primary/20 text-primary rounded-full">
                                        {selectedCount}
                                    </span>
                                )}
                            </div>
                            <motion.div
                                animate={{ rotate: expandedFilters.includes(filter.id) ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                {expandedFilters.includes(filter.id) ? (
                                    <Minus className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                                ) : (
                                    <Plus className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                                )}
                            </motion.div>
                        </button>
                        <AnimatePresence>
                            {expandedFilters.includes(filter.id) && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.25, ease: "easeInOut" }}
                                    className="space-y-1 overflow-hidden"
                                >
                                    {filter.options.map((option) => {
                                        const isChecked = filter.id === "skinType" 
                                            ? selectedSkinTypes.includes(option)
                                            : filter.id === "hairType" 
                                                ? selectedHairTypes.includes(option) 
                                                : false

                                        return (
                                            <label 
                                                key={option} 
                                                className={cn(
                                                    "flex items-center py-2.5 px-3 rounded-md cursor-pointer group transition-all",
                                                    "hover:bg-primary/5",
                                                    isChecked && "bg-primary/10 border border-primary/30"
                                                )}
                                            >
                                                <Checkbox
                                                    id={`${isMobile ? 'mobile' : 'desktop'}-${filter.id}-${option}`}
                                                    checked={isChecked}
                                                    onCheckedChange={() => {
                                                        if (filter.id === "skinType") toggleSkinType(option)
                                                        if (filter.id === "hairType") toggleHairType(option)
                                                    }}
                                                    className="border-2 border-muted-foreground/40 data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-all"
                                                />
                                                <span className={cn(
                                                    "ml-3 text-sm font-medium transition-colors",
                                                    isChecked 
                                                        ? "text-primary font-semibold" 
                                                        : "text-foreground/80 group-hover:text-foreground"
                                                )}>
                                                    {option}
                                                </span>
                                            </label>
                                        )
                                    })}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )
            })}

            {/* Price Range */}
            <div className="rounded-lg bg-card/50 border border-border/50 p-4 transition-all hover:border-border hover:shadow-sm">
                <button
                    onClick={() => toggleFilterExpand('price')}
                    className="flex items-center justify-between w-full mb-3 group"
                >
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary opacity-60 group-hover:opacity-100 transition-opacity" />
                        <span className="text-sm font-semibold uppercase tracking-wider text-foreground/90">
                            Prix
                        </span>
                        {(priceRange[0] !== 0 || priceRange[1] !== 1000) && (
                            <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-primary/20 text-primary rounded-full">
                                Actif
                            </span>
                        )}
                    </div>
                    <motion.div
                        animate={{ rotate: expandedFilters.includes('price') ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        {expandedFilters.includes('price') ? (
                            <Minus className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                        ) : (
                            <Plus className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                        )}
                    </motion.div>
                </button>
                <AnimatePresence>
                    {expandedFilters.includes('price') && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                            className="space-y-4 overflow-hidden pt-2"
                        >
                            <div className="px-1">
                                <Slider
                                    defaultValue={priceRange}
                                    onValueChange={setPriceRange}
                                    max={1000}
                                    step={5}
                                    className={cn("w-full", "py-4")}
                                    aria-label="Prix"
                                />
                            </div>
                            <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 px-1 py-1.5 rounded-md bg-primary/5 border border-primary/20">
                            <span className="text-xs font-medium text-muted-foreground uppercase ">Min</span>
                                    <span className="text-xs font-semibold text-primary">{priceRange[0]} TND</span>
                                </div>
                                <div className="h-px w-4 bg-border/50" />
                                <div className="flex items-center gap-1 px-1 py-1.5 rounded-md bg-primary/5 border border-primary/20">
                                    <span className="text-xs font-medium text-muted-foreground uppercase ">Max</span>
                                    <span className="text-xs font-semibold text-primary"> {priceRange[1]} TND</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}