"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useCart } from "@/components/cart-provider"
import { useToast } from "@/hooks/use-toast"
import type { Product } from "@/lib/models"
import { Minus, Plus, ShoppingBag, Package, Truck, ShieldCheck , ChevronLeft, ChevronRight } from "lucide-react"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { cn } from "@/lib/utils"
import { SHOP_CATEGORIES } from "@/lib/category-data" // adjust path as needed

interface ProductClientProps {
    product: Product
}
function getSubcategoryLabel(categoryId: string, subcategoryId: string): string {
    const category = SHOP_CATEGORIES.find(cat => cat.id === categoryId)
    if (!category?.subcategories) return subcategoryId
    
    // Search in first level subcategories
    for (const subcat of category.subcategories) {
        if (subcat.id === subcategoryId) return subcat.label
        
        // Search in nested subcategories
        if (subcat.subcategories) {
            const nestedSubcat = subcat.subcategories.find(nested => nested.id === subcategoryId)
            if (nestedSubcat) return nestedSubcat.label
        }
    }
    
    return subcategoryId // fallback to ID if not found
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

    // Get current variant or default product data
    const currentVariant = selectedColorIndex !== null && product.colorVariants 
        ? product.colorVariants[selectedColorIndex] 
        : null
    
    // Get images array - support both new images array and old single image field
    const productImages = product.images && product.images.length > 0 
        ? product.images 
        : (product.image ? [product.image] : [])
    
    const displayImages = currentVariant?.image ? [currentVariant.image] : productImages
    const displayImage = displayImages[selectedImageIndex] || displayImages[0]
    const displayQuantity = currentVariant?.quantity ?? product.quantity

    // Reset image loaded state when image changes
    useEffect(() => {
        setImageLoaded(false)
    }, [displayImage])

    // Reset selected image index when color variant changes
    useEffect(() => {
        setSelectedImageIndex(0)
        setThumbnailStartIndex(0)
    }, [selectedColorIndex])

    // Thumbnail slider navigation
    const THUMBNAILS_VISIBLE = 3
    const canScrollLeft = thumbnailStartIndex > 0
    const canScrollRight = thumbnailStartIndex + THUMBNAILS_VISIBLE < displayImages.length

    const scrollThumbnailsLeft = () => {
        if (canScrollLeft) {
            setThumbnailStartIndex(prev => Math.max(0, prev - 1))
        }
    }

    const scrollThumbnailsRight = () => {
        if (canScrollRight) {
            setThumbnailStartIndex(prev => Math.min(displayImages.length - THUMBNAILS_VISIBLE, prev + 1))
        }
    }

    const handleThumbnailClick = (index: number) => {
        setSelectedImageIndex(index)
        // Center the selected image in the middle position
        const middlePosition = Math.floor(THUMBNAILS_VISIBLE / 2) // This will be 1 for 3 thumbnails
        let newStartIndex = index - middlePosition
        
        // Adjust boundaries
        if (newStartIndex < 0) {
            newStartIndex = 0
        } else if (newStartIndex + THUMBNAILS_VISIBLE > displayImages.length) {
            newStartIndex = Math.max(0, displayImages.length - THUMBNAILS_VISIBLE)
        }
        
        setThumbnailStartIndex(newStartIndex)
    }

    // Calculate the number of items of this product already in the cart
    // For products with color variants, each variant is a distinct product with unique ID
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
        
        // Simulate a brief loading state for better UX
        await new Promise(resolve => setTimeout(resolve, 300))

        const itemName = currentVariant 
            ? `${product.name} - ${currentVariant.colorName}`
            : product.name
        
        // For products with variants, use unique ID per variant
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

    return (
        <div className="min-h-screen bg-background">
            <main className="container mx-auto px-4 lg:px-8 py-8 lg:py-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 xl:gap-24">

                    {/* Left Column: Image (Sticky on Desktop) */}
                    <div className="relative">
                        <div className="lg:sticky lg:top-24 space-y-4">
                            {/* Main Image */}
                            <div className="relative aspect-[4/5] w-full overflow-hidden bg-secondary/10 rounded-lg shadow-lg">
                                {/* Loading skeleton */}
                                {!imageLoaded && (
                                    <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 via-secondary/10 to-secondary/5 animate-pulse" />
                                )}
                                
                                <Image
                                    src={displayImage || "/placeholder.svg"}
                                    alt={product.name}
                                    fill
                                    className={cn(
                                        "object-cover transition-opacity duration-700",
                                        imageLoaded ? "opacity-100" : "opacity-0"
                                    )}
                                    priority
                                    onLoad={() => setImageLoaded(true)}
                                    onError={() => setImageLoaded(true)}
                                    key={displayImage} // Force re-render when image changes
                                />

                                {/* Gradient overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent" />
                                
                                {/* Image counter badge */}
                                {displayImages.length > 1 && (
                                    <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full">
                                        {selectedImageIndex + 1} / {displayImages.length}
                                    </div>
                                )}
                            </div>

                            {/* Thumbnail Gallery Slider */}
                            {displayImages.length > 1 && (
                                <div className="flex items-center gap-2">
                                    {/* Left Arrow */}
                                    <button
                                        type="button"
                                        onClick={scrollThumbnailsLeft}
                                        disabled={!canScrollLeft}
                                        className={cn(
                                            "flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-md transition-all",
                                            canScrollLeft
                                                ? "hover:bg-secondary text-foreground"
                                                : "text-muted-foreground/30 cursor-not-allowed"
                                        )}
                                        aria-label="Previous thumbnails"
                                    >
                                        <ChevronLeft className="h-5 w-5" />
                                    </button>

                                    {/* Thumbnails Container */}
                                    <div className="flex-1 overflow-hidden">
                                        <div className="grid grid-cols-3 gap-2">
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
                                                                "relative aspect-square cursor-pointer overflow-hidden rounded-md border transition-all duration-200",
                                                                selectedImageIndex === actualIndex
                                                                    ? "border-primary ring-1 ring-primary"
                                                                    : "border-border/50 hover:border-primary/50"
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

                                    {/* Right Arrow */}
                                    <button
                                        type="button"
                                        onClick={scrollThumbnailsRight}
                                        disabled={!canScrollRight}
                                        className={cn(
                                            "flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-md transition-all",
                                            canScrollRight
                                                ? "hover:bg-secondary text-foreground"
                                                : "text-muted-foreground/30 cursor-not-allowed"
                                        )}
                                        aria-label="Next thumbnails"
                                    >
                                        <ChevronRight className="h-5 w-5" />
                                    </button>
                                </div>
                            )}

                            {/* Trust Badges */}
                            <div className="grid grid-cols-3 gap-3 pt-4">
                                <div className="flex flex-col items-center text-center p-3 bg-secondary/20 rounded-lg hover:bg-secondary/30 transition-colors duration-300">
                                    <Package className="h-5 w-5 text-primary mb-2" />
                                    <span className="text-xs text-muted-foreground font-medium">Emballage soigné</span>
                                </div>
                                <div className="flex flex-col items-center text-center p-3 bg-secondary/20 rounded-lg hover:bg-secondary/30 transition-colors duration-300">
                                    <Truck className="h-5 w-5 text-primary mb-2" />
                                    <span className="text-xs text-muted-foreground font-medium">Livraison rapide</span>
                                </div>
                                <div className="flex flex-col items-center text-center p-3 bg-secondary/20 rounded-lg hover:bg-secondary/30 transition-colors duration-300">
                                    <ShieldCheck  className="h-5 w-5 text-primary mb-2" />
                                    <span className="text-xs text-muted-foreground font-medium">100% Authentique</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Details */}
                    <div className="flex flex-col justify-center space-y-8 lg:py-12">

                        {/* Header */}
                        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="flex items-center justify-between">
                               <div> <span className="sm:inline-block hidden text-xs uppercase  sm:tracking-[0.2em] border-r-2 border-primary/50  text-muted-foreground font-medium px-3 py-1 bg-secondary/30 rounded-l-full">
                                    {getCategoryLabel(product.category)}
                                </span><span className="text-xs uppercase sm:tracking-[0.2em] text-muted-foreground font-medium px-3 py-1 bg-secondary/60 rounded-full sm:rounded-r-full sm:rounded-l-none">
                                    {getSubcategoryLabel(product.category, product.subcategory?.toString() || "")}
                                </span></div>
                                {/* Stock Indicator */}
                                <div className="flex items-center gap-2 px-3 py-1 bg-secondary/20 rounded-full">
                                    <span className={cn(
                                        "w-2 h-2 rounded-full animate-pulse",
                                        inStock ? "bg-emerald-500" : "bg-destructive"
                                    )} />
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        {inStock ?  "En stock" : "Épuisé"}
                                    </span>
                                </div>
                            </div>

                            {/* Brand Name */}
                            {product.brand && (
                                <p className="text-sm uppercase tracking-[0.15em] text-primary font-semibold">
                                    {product.brand}
                                </p>
                            )}

                            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground leading-[1.1] tracking-tight">
                                {product.name}
                            </h1>

                            <div className="flex items-baseline gap-2">
                                <p className="text-3xl md:text-4xl font-semibold text-foreground tabular-nums">
                                    {product.price.toFixed(2)}
                                </p>
                                <span className="text-lg text-muted-foreground">DT</span>
                            </div>
                        </div>

                        {/* Short Description */}
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: "100ms" }}>
                            <p className="text-muted-foreground leading-relaxed text-base font-light border-l-2 border-primary/30 pl-4">
                                {product.description}
                            </p>
                        </div>

                        {/* Color Variants Selector */}
                        {product.hasColorVariants && product.colorVariants && product.colorVariants.length > 0 && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: "150ms" }}>
                                <div className="space-y-3">
                                    <Label className="text-xs uppercase tracking-widest font-semibold text-foreground">
                                        Couleur {currentVariant && `: ${currentVariant.colorName}`}
                                    </Label>
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
                                                    "relative w-16 h-16 rounded-lg border-2 transition-all duration-200 flex items-center justify-center",
                                                    selectedColorIndex === index
                                                        ? "border-primary scale-105 shadow-lg ring-2 ring-primary/20"
                                                        : "border-border hover:border-primary/50 hover:scale-102"
                                                )}
                                                style={{ backgroundColor: variant.color || "#000000" }}
                                                title={variant.colorName}
                                            >
                                                {selectedColorIndex === index && (
                                                    <div className="absolute inset-0 bg-primary/10 border-2 border-primary rounded-lg" />
                                                )}
                                                {variant.quantity === 0 && (
                                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg">
                                                        <span className="text-xs text-white font-semibold">Épuisé</span>
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="space-y-6 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: "200ms" }}>
                            {inStock && (
                                <div className="space-y-3">
                                    <Label className="text-xs uppercase tracking-widest font-semibold text-foreground">
                                        Quantité
                                    </Label>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center border-2 border-border rounded-lg overflow-hidden shadow-sm">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                className="h-12 w-12 rounded-none hover:bg-primary/10 transition-colors duration-200"
                                            >
                                                <Minus className="h-4 w-4" />
                                            </Button>
                                            <span className="w-16 text-center text-base font-semibold tabular-nums">{quantity}</span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setQuantity(Math.min(remainingStock, quantity + 1))}
                                                className="h-12 w-12 rounded-none hover:bg-primary/10 transition-colors duration-200"
                                                disabled={quantity >= remainingStock}
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-xs text-muted-foreground mb-1">
                                                Total: <span className="font-semibold text-foreground">{(product.price * quantity).toFixed(2)} DT</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <Button
                                onClick={handleAddToCart}
                                className={cn(
                                    "w-full h-14 text-sm uppercase tracking-[0.15em] rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl",
                                    "disabled:opacity-50 disabled:cursor-not-allowed",
                                    isAdding && "scale-95"
                                )}
                                disabled={!inStock || isAdding}
                                size="lg"
                            >
                                {isAdding ? (
                                    <span className="flex items-center gap-2">
                                        <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                        Ajout en cours...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <ShoppingBag className="h-4 w-4" />
                                        {inStock ? "Ajouter au Panier" : "Rupture de Stock"}
                                    </span>
                                )}
                            </Button>

                        </div>

                        {/* Accordions for Details */}
                        <div className="pt-8 border-t border-border/50 animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: "300ms" }}>
                            <Accordion type="single" collapsible className="w-full">
                                {product.longDescription && (
                                    <AccordionItem value="description" className="border-border/50">
                                        <AccordionTrigger className="text-sm uppercase tracking-widest font-semibold hover:no-underline hover:text-primary transition-colors">
                                            Description détaillée
                                        </AccordionTrigger>
                                        <AccordionContent className="text-muted-foreground leading-relaxed font-light pt-4 text-base whitespace-pre-wrap">
                                            {product.longDescription}
                                        </AccordionContent>
                                    </AccordionItem>
                                )}

                                {product.ingredients && product.ingredients.length > 0 && (
                                    <AccordionItem value="ingredients" className="border-border/50">
                                        <AccordionTrigger className="text-sm uppercase tracking-widest font-semibold hover:no-underline hover:text-primary transition-colors">
                                            Ingrédients
                                        </AccordionTrigger>
                                        <AccordionContent className="text-muted-foreground leading-relaxed font-light pt-4">
                                            <div className="flex flex-wrap gap-2">
                                                {product.ingredients.map((ingredient, index) => (
                                                    <span 
                                                        key={index}
                                                        className="px-3 py-1 bg-secondary/30 text-sm rounded-full hover:bg-secondary/40 transition-colors"
                                                    >
                                                        {ingredient}
                                                    </span>
                                                ))}
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                )}

                                <AccordionItem value="shipping" className="border-border/50">
                                    <AccordionTrigger className="text-sm uppercase tracking-widest font-semibold hover:no-underline hover:text-primary transition-colors">
                                        Livraison & Authenticité
                                    </AccordionTrigger>
                                    <AccordionContent className="text-muted-foreground leading-relaxed font-light pt-4 space-y-4">
                                        <div className="flex items-start gap-3">
                                            <Truck className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="font-medium text-foreground mb-1">Livraison gratuite</p>
                                                <p className="text-sm">Pour toutes les commandes de plus de 200 DT. Livraison standard sous 3-5 jours ouvrés.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <ShieldCheck  className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                                            <div>
  <p className="font-medium text-foreground mb-1">100% Authentique</p>
  <p className="text-sm">
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