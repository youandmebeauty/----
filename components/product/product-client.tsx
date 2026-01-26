"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useCart } from "@/components/cart-provider"
import { useToast } from "@/hooks/use-toast"
import type { Product } from "@/lib/models"
import { Minus, Plus, ShoppingBag, Package, Truck, ShieldCheck, ChevronLeft, ChevronRight } from "lucide-react"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { generateSlung } from "@/lib/product-url"
import { cn } from "@/lib/utils"
import { SHOP_CATEGORIES } from "@/lib/category-data"
import { Breadcrumb } from "@/components/breadcrumb"

interface ProductClientProps {
    product: Product
}

function getSubcategoryLabel(categoryId: string, subcategoryId: string): string {
    const category = SHOP_CATEGORIES.find(cat => cat.id === categoryId)
    if (!category?.subcategories) return subcategoryId
    
    for (const subcat of category.subcategories) {
        if (subcat.id === subcategoryId) return subcat.label
        
        if (subcat.subcategories) {
            const nestedSubcat = subcat.subcategories.find(nested => nested.id === subcategoryId)
            if (nestedSubcat) return nestedSubcat.label
        }
    }
    
    return subcategoryId
}

function getCategoryLabel(categoryId: string): string {
    const category = SHOP_CATEGORIES.find(cat => cat.id === categoryId)
    return category?.label || categoryId
}

export function ProductClient({ product }: ProductClientProps) {
    const { items, addItem, updateQuantity } = useCart()
    const { toast } = useToast()
    const [quantity, setQuantity] = useState(1)
    const [imageLoaded, setImageLoaded] = useState(false)
    const [isAdding, setIsAdding] = useState(false)
    const [selectedImageIndex, setSelectedImageIndex] = useState(0)
    const [thumbnailStartIndex, setThumbnailStartIndex] = useState(0)
    const [selectedColorIndex, setSelectedColorIndex] = useState<number | null>(
        product.hasColorVariants && product.colorVariants && product.colorVariants.length > 0 ? 0 : null
    )

    const currentVariant = selectedColorIndex !== null && product.colorVariants 
        ? product.colorVariants[selectedColorIndex] 
        : null
    
    const productImages = product.images && product.images.length > 0 
        ? product.images 
        : (product.image ? [product.image] : [])
    
    const displayImages = currentVariant?.image ? [currentVariant.image] : productImages
    const displayImage = displayImages[selectedImageIndex] || displayImages[0]
    const displayQuantity = currentVariant?.quantity ?? product.quantity

    const perfumeNotesTop = product.perfumeNotes?.top ?? []
    const perfumeNotesHeart = product.perfumeNotes?.heart ?? []
    const perfumeNotesBase = product.perfumeNotes?.base ?? []
    const hasPerfumeNotes =
        perfumeNotesTop.length > 0 || perfumeNotesHeart.length > 0 || perfumeNotesBase.length > 0


    useEffect(() => {
        setImageLoaded(false)
    }, [displayImage])

    useEffect(() => {
        setSelectedImageIndex(0)
        setThumbnailStartIndex(0)
    }, [selectedColorIndex])

    const THUMBNAILS_VISIBLE = 3
    const maxThumbnailStart = Math.max(0, displayImages.length - THUMBNAILS_VISIBLE)
    const canScrollLeft = selectedImageIndex > 0
    const canScrollRight = selectedImageIndex < displayImages.length - 1

    const syncSelectionWithThumbnails = (nextIndex: number) => {
        const middlePosition = Math.floor(THUMBNAILS_VISIBLE / 2)
        const clampedIndex = Math.min(Math.max(0, nextIndex), displayImages.length - 1)

        let newStartIndex = clampedIndex - middlePosition
        newStartIndex = Math.max(0, Math.min(newStartIndex, maxThumbnailStart))

        setSelectedImageIndex(clampedIndex)
        setThumbnailStartIndex(newStartIndex)
    }

    const scrollThumbnailsLeft = () => {
        if (canScrollLeft) {
            syncSelectionWithThumbnails(selectedImageIndex - 1)
        }
    }

    const scrollThumbnailsRight = () => {
        if (canScrollRight) {
            syncSelectionWithThumbnails(selectedImageIndex + 1)
        }
    }

    const handleThumbnailClick = (index: number) => {
        syncSelectionWithThumbnails(index)
    }

    const variantId = currentVariant 
        ? `${product.id}-${selectedColorIndex}`
        : product.id
    
    const cartQuantity = items
        .filter((item) => item.id === variantId)
        .reduce((sum, item) => sum + item.quantity, 0)

    const handleAddToCart = async () => {
        const remainingStock = displayQuantity - cartQuantity

        if (quantity > remainingStock) {
            toast({
                title: "Stock insuffisant",
                description: `Seulement ${remainingStock} article${remainingStock > 1 ? 's' : ''} disponible${remainingStock > 1 ? 's' : ''}.`,
                variant: "destructive",
            })
            return
        }

        setIsAdding(true)
        await new Promise(resolve => setTimeout(resolve, 300))

        const itemName = currentVariant 
            ? `${product.name} - ${currentVariant.colorName}`
            : product.name
        
        const itemId = currentVariant 
            ? `${product.id}-${selectedColorIndex}`
            : product.id
        
        const existingItem = items.find((item) => item.id === itemId)
        if (existingItem) {
            updateQuantity(itemId, existingItem.quantity + quantity)
        } else {
            addItem({
                id: itemId,
                name: itemName,
                price: product.price,
                image: displayImage || "/placeholder.svg",
                category: product.category,
            })
            if (quantity > 1) {
                updateQuantity(itemId, quantity)
            }
        }

        toast({
            description: (
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <ShoppingBag className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">Ajouté au panier</p>
                    </div>
                </div>
            ),
        })

        setIsAdding(false)
    }

    const inStock = displayQuantity > cartQuantity
    const remainingStock = displayQuantity - cartQuantity
    const slung = generateSlung(product.name, { 
        includeBrand: product.brand 
    })
  
    const categoryLabel = getCategoryLabel(product.category)
    const breadcrumbItems = [
        { name: "Boutique", href: "/shop" },
        { name: categoryLabel, href: `/shop?category=${product.category}` },
        { name: product.name, href: "#", current: true }
    ]

    return (
        <div className="min-h-screen">
            <main className="container mx-auto px-4 lg:px-8 py-8 lg:py-16">
                <Breadcrumb items={breadcrumbItems} className="mb-8" />
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 xl:gap-32">
                    {/* Left Column: Image */}
                    <div className="relative">
                        <div className="lg:sticky lg:top-24 space-y-6">
                            {/* Main Image */}
                            <div className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-50 rounded-sm">
                                {!imageLoaded && (
                                    <div className="absolute inset-0 bg-gradient-to-br from-zinc-100 via-zinc-50 to-white animate-pulse" />
                                )}
                                <div className="w-full h-full flex items-center justify-center bg-white">
                                <Image
                                    src={displayImage || "/placeholder.svg"}
                                    alt={product.name}
                                    width={1080}
                                    height={1350}
                                    className={cn(
                                        "transition-opacity duration-1000",
                                        imageLoaded ? "opacity-100" : "opacity-0"
                                    )}
                                    priority
                                    onLoad={() => setImageLoaded(true)}
                                    onError={() => setImageLoaded(true)}
                                    key={displayImage}
                                />
                                </div>
                                {displayImages.length > 1 && (
                                    <div className="absolute bottom-6 right-6 backdrop-blur-sm text-zinc-900 text-xs px-3 py-1.5 rounded-full font-light tracking-wider">
                                        {selectedImageIndex + 1} / {displayImages.length}
                                    </div>
                                )}
                            </div>

                            {/* Thumbnail Gallery */}
                            {displayImages.length > 1 && (
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={scrollThumbnailsLeft}
                                        disabled={!canScrollLeft}
                                        className={cn(
                                            "flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-sm border  transition-all",
                                            canScrollLeft
                                                ? "border-zinc-200 hover:border-zinc-400 text-zinc-700"
                                                : "border-zinc-100 text-zinc-300 cursor-not-allowed"
                                        )}
                                        aria-label="Previous thumbnails"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>

                                    <div className="flex-1 overflow-hidden">
                                        <div className="grid grid-cols-3 gap-3">
                                            {displayImages
                                                .slice(thumbnailStartIndex, thumbnailStartIndex + THUMBNAILS_VISIBLE)
                                                .map((image, relativeIndex) => {
                                                    const actualIndex = thumbnailStartIndex + relativeIndex
                                                    return (
                                                        <button
                                                            key={actualIndex}
                                                            type="button"
                                                            onClick={() => handleThumbnailClick(actualIndex)}
                                                            className={cn(
                                                                "relative aspect-square cursor-pointer overflow-hidden rounded-sm border transition-all duration-300",
                                                                selectedImageIndex === actualIndex
                                                                    ? "border-primary ring-1 ring-primary"
                                                                    : "border-zinc-200 hover:border-zinc-400"
                                                            )}
                                                        >
                                                            <img
                                                                src={image}
                                                                alt={`${product.name} - Image ${actualIndex + 1}`}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </button>
                                                    )
                                                })}
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={scrollThumbnailsRight}
                                        disabled={!canScrollRight}
                                        className={cn(
                                            "flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-sm border transition-all",
                                            canScrollRight
                                                ? "border-zinc-200 hover:border-zinc-400 text-zinc-700"
                                                : "border-zinc-100 text-zinc-300 cursor-not-allowed"
                                        )}
                                        aria-label="Next thumbnails"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>
                            )}

                            {/* Trust Badges
                            <div className="pt-6 border-t border-zinc-100">
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="flex flex-col items-center text-center py-4">
                                        <Package className="h-5 w-5 text-zinc-400 mb-3" />
                                        <span className="text-xs text-zinc-600 font-light leading-tight">Emballage<br/>soigné</span>
                                    </div>
                                    <div className="flex flex-col items-center text-center py-4 border-x border-zinc-100">
                                        <Truck className="h-5 w-5 text-zinc-400 mb-3" />
                                        <span className="text-xs text-zinc-600 font-light leading-tight">Livraison<br/>rapide</span>
                                    </div>
                                    <div className="flex flex-col items-center text-center py-4">
                                        <ShieldCheck className="h-5 w-5 text-zinc-400 mb-3" />
                                        <span className="text-xs text-zinc-600 font-light leading-tight">100%<br/>Authentique</span>
                                    </div>
                                </div>
                            </div> */}
                        </div>
                    </div>

                    {/* Right Column: Details */}
                    <div className="flex flex-col justify-center space-y-10 lg:py-12">
                        {/* Header */}
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="flex items-start justify-between gap-4">
                                <div className="space-y-2">
                                    <span className="text-[10px] uppercase tracking-[0.25em]  font-light">
                                        {getCategoryLabel(product.category)}
                                    </span>
                                    {product.subcategory && (
                                        <span className="block text-[10px] uppercase tracking-[0.2em]  font-light">
                                            {getSubcategoryLabel(product.category, product.subcategory?.toString() || "")}
                                        </span>
                                    )}
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    <span className={cn(
                                        "w-1.5 h-1.5 rounded-full",
                                        inStock ? "bg-emerald-400" : "bg-zinc-300"
                                    )} />
                                    <span className="text-[10px] uppercase tracking-[0.2em]  font-light">
                                        {inStock ? "En stock" : "Épuisé"}
                                    </span>
                                </div>
                            </div>

                            {product.brand && (
                                <p className="text-xs uppercase tracking-[0.3em] font-medium">
                                    {product.brand}
                                </p>
                            )}

                            <h1 className="font-light text-4xl md:text-4xl text-primary lg:text-6xl leading-[1.1] tracking-tight">
                                {product.name}
                            </h1>

                            <div className="flex items-baseline gap-3 pt-2">
                                <p className="text-3xl md:text-4xl font-light tabular-nums">
                                    {product.price.toFixed(2)}
                                </p>
                                <span className="text-base  font-light">DT</span>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: "100ms" }}>
                            <p className=" leading-relaxed text-sm font-light">
                                {product.description}
                            </p>
                        </div>

                        {/* Color Variants */}
                        {product.hasColorVariants && product.colorVariants && product.colorVariants.length > 0 && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: "150ms" }}>
                                <div className="space-y-4">
                                    <div className="flex items-baseline gap-3">
                                        <Label className="text-[10px] uppercase tracking-[0.25em] font-light">
                                            Couleur
                                        </Label>
                                        {currentVariant && (
                                            <span className="text-xs  font-light">{currentVariant.colorName}</span>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                        {product.colorVariants.map((variant, index) => (
                                            <button
                                                key={index}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedColorIndex(index)
                                                    setImageLoaded(false)
                                                    setQuantity(1)
                                                }}
                                                className={cn(
                                                    "relative w-12 h-12 rounded-full border-2 transition-all duration-300",
                                                    selectedColorIndex === index
                                                        ? "border-primary scale-110"
                                                        : "border-zinc-200 hover:border-zinc-400 hover:scale-105"
                                                )}
                                                style={{ backgroundColor: variant.color || "#000000" }}
                                                title={variant.colorName}
                                            >
                                                {variant.quantity === 0 && (
                                                    <div className="absolute inset-0 flex items-center justify-center rounded-full">
                                                        <div className="w-px h-8 rotate-45" />
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Quantity & Add to Cart */}
                        <div className="space-y-6 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: "200ms" }}>
                            {inStock && (
                                <div className="space-y-4">
                                    <Label className="text-[10px] uppercase tracking-[0.25em] font-light text-zinc-900">
                                        Quantité
                                    </Label>
                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center border border-zinc-200 rounded-sm">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                className="h-12 w-12 hover:bg-foreground rounded-l-sm rounded-r-none transition-colors"
                                            >
                                                <Minus className="h-3 w-3" />
                                            </Button>
                                            <span className="w-16 text-center text-sm font-light tabular-nums">{quantity}</span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setQuantity(Math.min(remainingStock, quantity + 1))}
                                                className="h-12 w-12 hover:bg-foreground rounded-r-sm rounded-l-none transition-colors"
                                                disabled={quantity >= remainingStock}
                                            >
                                                <Plus className="h-3 w-3" />
                                            </Button>
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-xs font-light">
                                                Total:{(product.price * quantity).toFixed(2)} DT
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <Button
                                onClick={handleAddToCart}
                                className={cn(
                                    "w-full h-14 text-[11px] uppercase tracking-[0.2em] rounded-sm transition-all duration-300 font-light",
                                    "bg-primary text-white hover:bg-primary/90",
                                    "disabled:opacity-40 disabled:cursor-not-allowed",
                                    isAdding && "scale-[0.98]"
                                )}
                                disabled={!inStock || isAdding}
                                size="lg"
                            >
                                {isAdding ? (
                                    <span className="flex items-center gap-2">
                                        <div className="h-3 w-3 border border-current border-t-transparent rounded-full animate-spin" />
                                        Ajout en cours
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-3">
                                        <ShoppingBag className="h-4 w-4" />
                                        {inStock ? "Ajouter au Panier" : "Rupture de Stock"}
                                    </span>
                                )}
                            </Button>
                        </div>

                        {/* Accordions */}
                        <div className="pt-10 border-t border-zinc-100 animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: "300ms" }}>
                            <Accordion type="multiple" className="w-full">
                                {hasPerfumeNotes && (
                                    <AccordionItem value="notes" className="border-none">
                                        <AccordionTrigger className="text-xs uppercase tracking-[0.2em] font-light hover:no-underline py-6 border-b border-zinc-200 hover:border-zinc-400 transition-colors [&[data-state=open]]:border-zinc-400">
                                            <span className="flex items-center gap-3">
                                                <span className="w-1 h-1 rounded-full bg-zinc-400"></span>
                                                Notes olfactives
                                            </span>
                                        </AccordionTrigger>

                                        <AccordionContent className="pt-8 pb-4">
                                            <div className="space-y-10">
                                                {perfumeNotesTop.length > 0 && (
                                                    <div className="group">
                                                        <div className="flex items-baseline gap-4 mb-4">
                                                            <h3 className="text-sm font-light min-w-[120px]">
                                                                Notes de tête
                                                            </h3>
                                                            <div className="flex-1 h-px bg-gradient-to-r from-zinc-200 to-transparent"></div>
                                                        </div>
                                                        
                                                        <p className="text-xs text-zinc-500 italic mb-3 ml-[120px]">
                                                            La première impression
                                                        </p>

                                                        <div className="flex flex-wrap gap-2 ml-[120px]">
                                                            {perfumeNotesTop.map((note, i) => (
                                                                <span
                                                                    key={i}
                                                                    className="px-4 py-2 text-xs tracking-wide font-light border border-zinc-200 hover:border-zinc-400 hover:shadow-sm transition-all duration-300 rounded-sm"
                                                                >
                                                                    {note}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {perfumeNotesHeart.length > 0 && (
                                                    <div className="group">
                                                        <div className="flex items-baseline gap-4 mb-4">
                                                            <h3 className="text-sm font-light min-w-[120px]">
                                                                Notes de cœur
                                                            </h3>
                                                            <div className="flex-1 h-px bg-gradient-to-r from-zinc-200 to-transparent"></div>
                                                        </div>
                                                        
                                                        <p className="text-xs text-zinc-500 italic mb-3 ml-[120px]">
                                                            Le caractère du parfum
                                                        </p>

                                                        <div className="flex flex-wrap gap-2 ml-[120px]">
                                                            {perfumeNotesHeart.map((note, i) => (
                                                                <span
                                                                    key={i}
                                                                    className="px-4 py-2 text-xs tracking-wide font-light border border-zinc-200 hover:border-zinc-400 hover:shadow-sm transition-all duration-300 rounded-sm"
                                                                >
                                                                    {note}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {perfumeNotesBase.length > 0 && (
                                                    <div className="group">
                                                        <div className="flex items-baseline gap-4 mb-4">
                                                            <h3 className="text-sm font-light min-w-[120px]">
                                                                Notes de fond
                                                            </h3>
                                                            <div className="flex-1 h-px bg-gradient-to-r from-zinc-200 to-transparent"></div>
                                                        </div>
                                                        
                                                        <p className="text-xs text-zinc-500 italic mb-3 ml-[120px]">
                                                            La signature durable
                                                        </p>

                                                        <div className="flex flex-wrap gap-2 ml-[120px]">
                                                            {perfumeNotesBase.map((note, i) => (
                                                                <span
                                                                    key={i}
                                                                    className="px-4 py-2 text-xs tracking-wide font-light border border-zinc-200 hover:border-zinc-400 hover:shadow-sm transition-all duration-300 rounded-sm"
                                                                >
                                                                    {note}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                )}

                                {product.longDescription && (
                                    <AccordionItem value="description" className="border-none">
                                        <AccordionTrigger className="text-xs uppercase tracking-[0.2em] font-light hover:no-underline py-6 border-b border-zinc-200 hover:border-zinc-400 transition-colors [&[data-state=open]]:border-zinc-400">
                                            <span className="flex items-center gap-3">
                                                <span className="w-1 h-1 rounded-full bg-zinc-400"></span>
                                                Description détaillée
                                            </span>
                                        </AccordionTrigger>
                                        <AccordionContent className="pt-6 pb-4 leading-relaxed font-light text-sm whitespace-pre-wrap">
                                            {product.longDescription}
                                        </AccordionContent>
                                    </AccordionItem>
                                )}

                                {product.howToUse && product.category==="soins" && product.howToUse.trim() !== "" && (
                                    <AccordionItem value="howToUse" className="border-none">
                                        <AccordionTrigger className="text-xs uppercase tracking-[0.2em] font-light hover:no-underline py-6 border-b border-zinc-200 hover:border-zinc-400 transition-colors [&[data-state=open]]:border-zinc-400">
                                            <span className="flex items-center gap-3">
                                                <span className="w-1 h-1 rounded-full bg-zinc-400"></span>
                                                Conseil d'utilisation
                                            </span>
                                        </AccordionTrigger>
                                        <AccordionContent className="pt-6 pb-4 leading-relaxed font-light text-sm whitespace-pre-wrap">
                                            {product.howToUse}
                                        </AccordionContent>
                                    </AccordionItem>
                                )}

                                {product.ingredients && product.ingredients.length > 0 && (
                                    <AccordionItem value="ingredients" className="border-none">
                                        <AccordionTrigger className="text-xs uppercase tracking-[0.2em] font-light hover:no-underline py-6 border-b border-zinc-200 hover:border-zinc-400 transition-colors [&[data-state=open]]:border-zinc-400">
                                            <span className="flex items-center gap-3">
                                                <span className="w-1 h-1 rounded-full bg-zinc-400"></span>
                                                Ingrédients
                                            </span>
                                        </AccordionTrigger>
                                        <AccordionContent className="pt-6 pb-4">
                                            <div className="flex flex-wrap gap-2">
                                                {product.ingredients.map((ingredient, index) => (
                                                    <span 
                                                        key={index}
                                                        className="px-4 py-2 text-xs tracking-wide font-light  border border-zinc-200 hover:border-zinc-400 hover:shadow-sm transition-all duration-300 rounded-sm"
                                                    >
                                                        {ingredient}
                                                    </span>
                                                ))}
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                )}

                                <AccordionItem value="shipping" className="border-none">
                                    <AccordionTrigger className="text-xs uppercase tracking-[0.2em] font-light hover:no-underline py-6 border-b border-zinc-200 hover:border-zinc-400 transition-colors [&[data-state=open]]:border-zinc-400">
                                        <span className="flex items-center gap-3">
                                            <span className="w-1 h-1 rounded-full bg-zinc-400"></span>
                                            Livraison & Authenticité
                                        </span>
                                    </AccordionTrigger>
                                    <AccordionContent className="pt-6 pb-4 space-y-6">
                                        <div className="flex items-start gap-4">
                                            <Truck className="h-4 w-4 text-zinc-400 mt-1 flex-shrink-0" />
                                            <div>
                                                <p className="font-light mb-2 text-sm">Livraison gratuite</p>
                                                <p className="text-xs text-zinc-500 leading-relaxed">Pour toutes les commandes de plus de 200 DT. Livraison standard sous 3-5 jours ouvrés.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4">
                                            <ShieldCheck className="h-4 w-4 text-zinc-400 mt-1 flex-shrink-0" />
                                            <div>
                                                <p className="font-light mb-2 text-sm">100% Authentique</p>
                                                <p className="text-xs text-zinc-500 leading-relaxed">
                                                    Tous nos produits sont garantis 100% authentiques, provenant directement des fournisseurs officiels ou marques partenaires.
                                                </p>
                                            </div>
                                        </div>
                                        
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}