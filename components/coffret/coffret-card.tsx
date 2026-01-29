"use client"
import { Coffret } from "@/lib/models"
import { cn } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShoppingBag, ArrowRight, Package } from "lucide-react"
import {  getCoffretUrl } from "@/lib/coffret-url"

import { toast } from "../ui/use-toast"
import { useCart } from "../cart-provider"


interface CoffretCardProps {
    coffret: Coffret
    productNames?: string[]
    className?: string
    aspectRatio?: "portrait" | "square"
    priority?: boolean
}

export function CoffretCard({
    coffret,
    className,
    aspectRatio = "portrait",
    priority = false
}: CoffretCardProps) {
      const { items, addItem, updateQuantity } = useCart()
  
  const coffretImages = coffret.images && coffret.images.length > 0 
    ? coffret.images 
    : ["/placeholder.svg"]

  const cartQuantity = items
    .filter((item) => item.id === coffret.id)
    .reduce((sum, item) => sum + item.quantity, 0)
  const displayImage = coffretImages[0]

  const remainingStock = (coffret.stock || 0) - cartQuantity
  const inStock = remainingStock > 0
  const handleAddToCart = async () => {
    if (1 > remainingStock) {
      toast({
        title: "Stock insuffisant",
        description: `Seulement ${remainingStock} article${remainingStock > 1 ? 's' : ''} disponible${remainingStock > 1 ? 's' : ''}.`,
        variant: "destructive",
      })
      return
    }

    await new Promise(resolve => setTimeout(resolve, 300))

    const existingItem = items.find((item) => item.id === coffret.id)
    if (existingItem) {
      updateQuantity(coffret.id, existingItem.quantity + 1)
    } else {
      addItem({
        id: coffret.id,
        name: coffret.name,
        price: coffret.price,
        image: displayImage,
        category: "Coffret",
      })
    }

    toast({
      description: (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
            <ShoppingBag className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="font-medium">{coffret.name}</p>
            <p className="text-sm text-muted-foreground">Ajouté au panier</p>
          </div>
        </div>
      ),
    })

  }


    const coffretUrl = getCoffretUrl(coffret)
    const hasDiscount = coffret.originalPrice && coffret.originalPrice > coffret.price
    const discountPercentage = hasDiscount 
        ? Math.round(((coffret.originalPrice! - coffret.price) / coffret.originalPrice!) * 100)
        : 0
    return (
        <article 
            className={cn(
                "group relative flex flex-col space-y-3 h-full",
                className
            )}
            aria-label={`Coffret ${coffret.name}`}
        >                       <Link 
                    href={coffretUrl} className="flex flex-col gap-3"
                >             {hasDiscount && (
                        <div className="absolute top-3 left-3 z-10">
                            <Badge 
                                variant="sticker" 
                                className="absolute top-2 -left-8 font-semibold tracking-widest shadow-lg bg-red-400"
                            >
                                -{discountPercentage}%
                            </Badge>
                        </div>
                    )}
            {/* Image Container */}

                <div className={cn(
                    "relative w-full overflow-hidden transition-all duration-500",
                    aspectRatio === "portrait" ? "aspect-[3/4]" : "aspect-square"
                )}>


                    {/* Out of Stock Badge */}
                    {coffret.stock === 0 && (
                        <div className="absolute top-3 right-3 z-10">
                            <Badge 
                                variant="secondary" 
                                className="bg-gray-500 text-white font-medium shadow-lg"
                            >
                                Rupture de stock
                            </Badge>
                        </div>
                    )}

                    {/* Main Image */}
                    <div className="absolute inset-0  ">
                        <Image
                            src={coffret.images?.[0] || "/placeholder.svg"}
                            alt={`Image du coffret ${coffret.name}`}
                            fill
                            className="object-cover rounded-xl"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            priority={priority}
                        />
                    </div>

                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t rounded-b-xl from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Product Count Badge */}
                    {coffret.productIds && coffret.productIds.length > 0 && (
                        <div className="absolute bottom-3 left-3 z-10 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                            <Badge 
                                variant="secondary" 
                                className="bg-white/90 backdrop-blur-sm text-foreground shadow-lg"
                            >
                                <Package className="w-3 h-3 mr-1" />
                                {coffret.productIds.length} produits
                            </Badge>
                        </div>
                    )}

                    {/* Quick Action Button */}
                    {inStock ?  (
                        <div className="absolute bottom-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                            <Button 
                                size="icon" 
                                className="rounded-full bg-white text-black hover:bg-white/90 shadow-lg"
                                aria-label="Ajouter au panier"
                                onClick={handleAddToCart}
                            >
                                <ShoppingBag className="h-4 w-4" />
                            </Button>
                        </div>
                    ) : (
                        <div className="absolute bottom-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                            <Button 
                                size="icon" 
                                className="rounded-full bg-gray-500 text-black hover:bg-gray-500 shadow-lg pointer-events-none"
                                aria-label="Ajouter au panier"
                            >
                                <ShoppingBag className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>

            {/* Content */}
            <div className="space-y-2 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-2">
                    <h3 className=" uppercase text-2xl leading-tight group-hover:text-primary transition-colors flex-1">

                            {coffret.name}
                    </h3>
                    <div className="flex flex-col items-end gap-1">
                        <div className="text-lg font-light tabular-nums">
                            {coffret.price.toFixed(2)} DT
                        </div>
 
                    </div>
                </div>
 
            </div>
            </Link>

        </article>
    )
}
