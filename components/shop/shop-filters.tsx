"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Minus, ChevronDown, ChevronRight } from "lucide-react"
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
    expandedFilters,
    toggleFilterExpand
}: ShopFiltersProps) {
    const activeCategory = SHOP_CATEGORIES.find(c => c.id === selectedCategory)
    const [expandedSubcats, setExpandedSubcats] = useState<string[]>([])

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
        <div className="space-y-0 divide-y divide-border/10">
            {/* Category Filter */}
            <div className="py-6">
                <button
                    onClick={() => toggleFilterExpand('category')}
                    className="flex items-center justify-between w-full mb-4"
                >
                    <span className="text-sm font-medium uppercase tracking-wider">Catégorie</span>
                    {expandedFilters.includes('category') ? (
                        <Minus className="w-4 h-4" />
                    ) : (
                        <Plus className="w-4 h-4" />
                    )}
                </button>
                <AnimatePresence>
                    {expandedFilters.includes('category') && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-2 overflow-hidden"
                        >
                            <label className="flex items-center py-2 cursor-pointer group">
                                <input
                                    type="radio"
                                    name={`${isMobile ? 'mobile' : 'desktop'}-category`}
                                    checked={selectedCategory === "all"}
                                    onChange={() => handleCategoryChange("all")}
                                    className="w-4 h-4 border-2 border-gray-300 text-foreground focus:ring-0 focus:ring-offset-0"
                                />
                                <span className="ml-3 text-sm group-hover:text-foreground transition-colors">
                                    Tous les produits
                                </span>
                            </label>
                            {SHOP_CATEGORIES.map((category) => (
                                <label key={category.id} className="flex items-center py-2 cursor-pointer group">
                                    <input
                                        type="radio"
                                        name={`${isMobile ? 'mobile' : 'desktop'}-category`}
                                        checked={selectedCategory === category.id}
                                        onChange={() => handleCategoryChange(category.id)}
                                        className="w-4 h-4 border-2 border-gray-300 text-foreground focus:ring-0 focus:ring-offset-0"
                                    />
                                    <span className="ml-3 text-sm group-hover:text-foreground transition-colors">
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
                <div className="py-6">
                    <button
                        onClick={() => toggleFilterExpand('subcategory')}
                        className="flex items-center justify-between w-full mb-4"
                    >
                        <span className="text-sm font-medium uppercase tracking-wider">Type</span>
                        {expandedFilters.includes('subcategory') ? (
                            <Minus className="w-4 h-4" />
                        ) : (
                            <Plus className="w-4 h-4" />
                        )}
                    </button>
                    <AnimatePresence>
                        {expandedFilters.includes('subcategory') && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-2 overflow-hidden"
                            >
                                {activeCategory.subcategories.map((sub) => {
                                    const hasChildren = sub.subcategories && sub.subcategories.length > 0
                                    const isExpanded = expandedSubcats.includes(sub.id)

                                    return (
                                        <div key={sub.id}>
                                            <div className="flex items-center justify-between py-2 group">
                                                <label className="flex items-center cursor-pointer flex-1">
                                                    <Checkbox
                                                        id={`${isMobile ? 'mobile' : 'desktop'}-sub-${sub.id}`}
                                                        checked={selectedSubcategory === sub.id}
                                                        onCheckedChange={() => handleSubcategoryChange(sub.id)}
                                                        className="border-2 border-gray-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                                    />
                                                    <span className="ml-3 text-sm font-medium group-hover:text-foreground transition-colors">
                                                        {sub.label}
                                                    </span>
                                                </label>

                                                {hasChildren && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault()
                                                            toggleSubcatExpand(sub.id)
                                                        }}
                                                        className="p-1 hover:bg-muted rounded-full transition-colors"
                                                    >
                                                        {isExpanded ? (
                                                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                                        ) : (
                                                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                                        )}
                                                    </button>
                                                )}
                                            </div>

                                            {/* Nested Subcategories */}
                                            <AnimatePresence>
                                                {hasChildren && isExpanded && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: "auto", opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.2 }}
                                                        className="ml-6 space-y-1 border-l-2 border-border/50 pl-3 my-1 overflow-hidden"
                                                    >
                                                        {sub.subcategories!.map((child) => (
                                                            <label key={child.id} className="flex items-center py-1.5 cursor-pointer group">
                                                                <Checkbox
                                                                    id={`${isMobile ? 'mobile' : 'desktop'}-sub-${child.id}`}
                                                                    checked={selectedSubcategory === child.id}
                                                                    onCheckedChange={() => handleSubcategoryChange(child.id)}
                                                                    className="w-3.5 h-3.5 border-2 border-gray-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                                                />
                                                                <span className="ml-2 text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                                                                    {child.label}
                                                                </span>
                                                            </label>
                                                        ))}
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

                return (
                    <div key={filter.id} className="py-6">
                        <button
                            onClick={() => toggleFilterExpand(filter.id)}
                            className="flex items-center justify-between w-full mb-4"
                        >
                            <span className="text-sm font-medium uppercase tracking-wider">{filter.label}</span>
                            {expandedFilters.includes(filter.id) ? (
                                <Minus className="w-4 h-4" />
                            ) : (
                                <Plus className="w-4 h-4" />
                            )}
                        </button>
                        <AnimatePresence>
                            {expandedFilters.includes(filter.id) && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="space-y-2 overflow-hidden"
                                >
                                    {filter.options.map((option) => (
                                        <label key={option} className="flex items-center py-2 cursor-pointer group">
                                            <Checkbox
                                                id={`${isMobile ? 'mobile' : 'desktop'}-${filter.id}-${option}`}
                                                checked={
                                                    filter.id === "skinType" ? selectedSkinTypes.includes(option) :
                                                        filter.id === "hairType" ? selectedHairTypes.includes(option) : false
                                                }
                                                onCheckedChange={() => {
                                                    if (filter.id === "skinType") toggleSkinType(option)
                                                    if (filter.id === "hairType") toggleHairType(option)
                                                }}
                                                className="border-2 border-gray-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                            />
                                            <span className="ml-3 text-sm group-hover:text-foreground transition-colors">
                                                {option}
                                            </span>
                                        </label>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )
            })}

            {/* Price Range */}
            <div className="py-6">
                <button
                    onClick={() => toggleFilterExpand('price')}
                    className="flex items-center justify-between w-full mb-4"
                >
                    <span className="text-sm font-medium uppercase tracking-wider">Prix</span>
                    {expandedFilters.includes('price') ? (
                        <Minus className="w-4 h-4" />
                    ) : (
                        <Plus className="w-4 h-4" />
                    )}
                </button>
                <AnimatePresence>
                    {expandedFilters.includes('price') && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-4 overflow-hidden pt-2"
                        >
                            <Slider
                                value={priceRange}
                                onValueChange={setPriceRange}
                                max={200}
                                step={5}
                                className="py-4"
                            />
                            <div className="flex items-center justify-between text-sm">
                                <span>{priceRange[0]}TND</span>
                                <span>{priceRange[1]}TND</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}