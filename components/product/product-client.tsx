"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useCart } from "@/components/cart-provider"
import { useToast } from "@/hooks/use-toast"
import type { Product } from "@/lib/models"
import { Minus, Plus, ShoppingBag, Package, Truck, RotateCcw } from "lucide-react"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { cn } from "@/lib/utils"

interface ProductClientProps {
    product: Product
}

export function ProductClient({ product }: ProductClientProps) {
    const { items, addItem, updateQuantity } = useCart()
    const { toast } = useToast()
    const [quantity, setQuantity] = useState(1)
    const [imageLoaded, setImageLoaded] = useState(false)
    const [isAdding, setIsAdding] = useState(false)

    // Calculate the number of items of this product already in the cart
    const cartQuantity = items
        .filter((item) => item.id === product.id)
        .reduce((sum, item) => sum + item.quantity, 0)

    const handleAddToCart = async () => {
        const remainingStock = product.quantity - cartQuantity

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

        const existingItem = items.find((item) => item.id === product.id)
        if (existingItem) {
            updateQuantity(product.id, existingItem.quantity + quantity)
        } else {
            addItem({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                category: product.category,
            })
            if (quantity > 1) {
                updateQuantity(product.id, quantity)
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

    const inStock = product.quantity > cartQuantity
    const remainingStock = product.quantity - cartQuantity
    const stockPercentage = (remainingStock / product.quantity) * 100
    const isLowStock = stockPercentage <= 20 && stockPercentage > 0

    return (
        <div className="min-h-screen bg-background">
            <main className="container mx-auto px-4 lg:px-8 py-8 lg:py-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 xl:gap-24">

                    {/* Left Column: Image (Sticky on Desktop) */}
                    <div className="relative">
                        <div className="lg:sticky lg:top-24 space-y-4">
                            <div className="relative aspect-[4/5] w-full overflow-hidden bg-secondary/10 rounded-lg shadow-lg">
                                {/* Loading skeleton */}
                                {!imageLoaded && (
                                    <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 via-secondary/10 to-secondary/5 animate-pulse" />
                                )}
                                
                                <Image
                                    src={product.image || "/placeholder.svg"}
                                    alt={product.name}
                                    fill
                                    className={cn(
                                        "object-cover transition-opacity duration-700",
                                        imageLoaded ? "opacity-100" : "opacity-0"
                                    )}
                                    priority
                                    onLoad={() => setImageLoaded(true)}
                                />

                                {/* Gradient overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent" />
                            </div>

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
                                    <RotateCcw className="h-5 w-5 text-primary mb-2" />
                                    <span className="text-xs text-muted-foreground font-medium">Retours 7 jours</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Details */}
                    <div className="flex flex-col justify-center space-y-8 lg:py-12">

                        {/* Header */}
                        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="flex items-center justify-between">
                                <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-medium px-3 py-1 bg-secondary/30 rounded-full">
                                    {product.category}
                                </span>
                                {/* Stock Indicator */}
                                <div className="flex items-center gap-2 px-3 py-1 bg-secondary/20 rounded-full">
                                    <span className={cn(
                                        "w-2 h-2 rounded-full animate-pulse",
                                        inStock ? "bg-emerald-500" : "bg-destructive"
                                    )} />
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        {inStock ? isLowStock ? "Stock limité" : "En stock" : "Épuisé"}
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
                                <span className="text-lg text-muted-foreground">TND</span>
                            </div>
                        </div>

                        {/* Short Description */}
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: "100ms" }}>
                            <p className="text-muted-foreground leading-relaxed text-base font-light border-l-2 border-primary/30 pl-4">
                                {product.description}
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="space-y-6 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: "200ms" }}>
                            {inStock && (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs uppercase tracking-widest font-semibold text-foreground">Quantité</span>
                                        {isLowStock && (
                                            <span className="text-xs text-amber-600 font-medium">
                                                Plus que {remainingStock} disponible{remainingStock > 1 ? 's' : ''}
                                            </span>
                                        )}
                                    </div>
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
                                                Total: <span className="font-semibold text-foreground">{(product.price * quantity).toFixed(2)} TND</span>
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

                            {/* Stock Progress Bar */}
                            {inStock && isLowStock && (
                                <div className="space-y-2 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-lg">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-amber-800 dark:text-amber-200 font-medium">Stock restant</span>
                                        <span className="text-amber-900 dark:text-amber-100 font-semibold">{remainingStock} / {product.quantity}</span>
                                    </div>
                                    <div className="h-2 bg-amber-200 dark:bg-amber-900/40 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full transition-all duration-500"
                                            style={{ width: `${stockPercentage}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Accordions for Details */}
                        <div className="pt-8 border-t border-border/50 animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: "300ms" }}>
                            <Accordion type="single" collapsible className="w-full">
                                {product.longDescription && (
                                    <AccordionItem value="description" className="border-border/50">
                                        <AccordionTrigger className="text-sm uppercase tracking-widest font-semibold hover:no-underline hover:text-primary transition-colors">
                                            Description détaillée
                                        </AccordionTrigger>
                                        <AccordionContent className="text-muted-foreground leading-relaxed font-light pt-4 text-base">
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
                                        Livraison & Retours
                                    </AccordionTrigger>
                                    <AccordionContent className="text-muted-foreground leading-relaxed font-light pt-4 space-y-4">
                                        <div className="flex items-start gap-3">
                                            <Truck className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="font-medium text-foreground mb-1">Livraison gratuite</p>
                                                <p className="text-sm">Pour toutes les commandes de plus de 200 TND. Livraison standard sous 3-5 jours ouvrés.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <RotateCcw className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="font-medium text-foreground mb-1">Retours faciles</p>
                                                <p className="text-sm">Les retours sont acceptés dans les 7 jours suivant l'achat. Produit non utilisé et dans son emballage d'origine.</p>
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