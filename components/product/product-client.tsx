"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useCart } from "@/components/cart-provider"
import { useToast } from "@/hooks/use-toast"
import type { Product } from "@/lib/models"
import { Minus, Plus } from "lucide-react"
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

    // Calculate the number of items of this product already in the cart
    const cartQuantity = items
        .filter((item) => item.id === product.id)
        .reduce((sum, item) => sum + item.quantity, 0)

    const handleAddToCart = () => {
        const remainingStock = product.quantity - cartQuantity

        if (quantity > remainingStock) {
            toast({
                title: "Erreur",
                description: `Impossible d'ajouter ${quantity} articles supplémentaires. Seulement ${remainingStock} disponible.`,
                variant: "destructive",
            })
            return
        }

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
            description: `${product.name} ajouté au panier`,
        })
    }

    const inStock = product.quantity > cartQuantity

    return (
        <div className="min-h-screen bg-background">
            <main className="container mx-auto px-4 lg:px-8 py-8 lg:py-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">

                    {/* Left Column: Image (Sticky on Desktop) */}
                    <div className="relative">
                        <div className="lg:sticky lg:top-24 aspect-[4/5] w-full overflow-hidden bg-secondary/20 rounded-sm">
                            <Image
                                src={product.image || "/placeholder.svg"}
                                alt={product.name}
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                    </div>

                    {/* Right Column: Details */}
                    <div className="flex flex-col justify-center space-y-8 lg:py-12">

                        {/* Header */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                                    {product.category}
                                </span>
                                {/* Stock Indicator */}
                                <div className="flex items-center gap-2">
                                    <span className={cn("w-1.5 h-1.5 rounded-full", inStock ? "bg-emerald-600" : "bg-destructive")} />
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        {inStock ? "In Stock" : "Out of Stock"}
                                    </span>
                                </div>
                            </div>

                            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground leading-tight">
                                {product.name}
                            </h1>

                            {/* Brand Name */}
                            {product.brand && (
                                <p className="text-lg text-muted-foreground font-light tracking-wide">
                                    {product.brand}
                                </p>
                            )}

                            <p className="text-2xl md:text-3xl font-medium text-foreground">
                                {product.price.toFixed(2)} TND
                            </p>
                        </div>

                        {/* Short Description */}
                        <p className="text-muted-foreground leading-relaxed text-lg font-light">
                            {product.description}
                        </p>

                        {/* Actions */}
                        <div className="space-y-6 pt-6 border-t border-border/50">
                            {inStock && (
                                <div className="flex items-center gap-6">
                                    <span className="text-xs uppercase tracking-widest font-medium text-foreground">Quantity</span>
                                    <div className="flex items-center border border-border rounded-none">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="h-10 w-10 rounded-none hover:bg-primary/40"
                                        >
                                            <Minus className="h-3 w-3" />
                                        </Button>
                                        <span className="w-12 text-center text-sm font-medium">{quantity}</span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setQuantity(Math.min(product.quantity - cartQuantity, quantity + 1))}
                                            className="h-10 w-10 rounded-none hover:bg-primary/40"
                                        >
                                            <Plus className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            )}

                            <Button
                                onClick={handleAddToCart}
                                className="w-full h-14 text-sm uppercase tracking-[0.15em] rounded-none transition-all duration-500"
                                disabled={!inStock}
                                size="lg"
                            >
                                {inStock ? "Ajouter au Panier" : "Rupture de Stock"}
                            </Button>
                        </div>

                        {/* Accordions for Details */}
                        <div className="pt-8">
                            <Accordion type="single" collapsible className="w-full">
                                {product.longDescription && (
                                    <AccordionItem value="description" className="border-border/50">
                                        <AccordionTrigger className="text-sm uppercase tracking-widest font-medium hover:no-underline">
                                            Description
                                        </AccordionTrigger>
                                        <AccordionContent className="text-muted-foreground leading-relaxed font-light">
                                            {product.longDescription}
                                        </AccordionContent>
                                    </AccordionItem>
                                )}

                                {product.ingredients && product.ingredients.length > 0 && (
                                    <AccordionItem value="ingredients" className="border-border/50">
                                        <AccordionTrigger className="text-sm uppercase tracking-widest font-medium hover:no-underline">
                                            Ingredients
                                        </AccordionTrigger>
                                        <AccordionContent className="text-muted-foreground leading-relaxed font-light">
                                            {product.ingredients.join(", ")}
                                        </AccordionContent>
                                    </AccordionItem>
                                )}

                                <AccordionItem value="shipping" className="border-border/50">
                                    <AccordionTrigger className="text-sm uppercase tracking-widest font-medium hover:no-underline">
                                        Livraison & Retours
                                    </AccordionTrigger>
                                    <AccordionContent className="text-muted-foreground leading-relaxed font-light">
                                        Livraison gratuite pour les commandes de plus de 200 TND. Les retours sont acceptés dans les 7 jours suivant l'achat.
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