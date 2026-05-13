"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useCart } from "../providers/cart-provider"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils/utils"
import { ShoppingBag } from "lucide-react"
import { useState } from "react"
import { generateSlug } from "@/lib/urls/product-url"
import { Product } from "@/lib/models/models"
import { trackCartAddition } from "@/lib/services/meta-events"

interface ProductCardProps {
  product: Product
  className?: string
  onNavigateStart?: () => void
}

export function ProductCard({ product, className, onNavigateStart }: ProductCardProps) {
  const { items, addItem, updateQuantity } = useCart()
  const [imageLoaded, setImageLoaded] = useState(false)

  const cartQuantity = items
    .filter((item) => item.id === product.id)
    .reduce((sum, item) => sum + item.quantity, 0)

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (product.hasColorVariants && product.colorVariants && product.colorVariants.length > 0) {
      return
    }

    const remainingStock = product.quantity - cartQuantity
    if (1 > remainingStock) return

    await trackCartAddition([
      { id: product.id, name: product.name, price: product.price, quantity: 1 }
    ])

    const existingItem = items.find((item) => item.id === product.id)
    if (existingItem) {
      updateQuantity(product.id, existingItem.quantity + 1)
    } else {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        promoPrice:
          typeof product.promoPrice === "number" && product.promoPrice < product.price
            ? product.promoPrice
            : undefined,
        image:
          (product.images && product.images.length > 0 ? product.images[0] : product.image) ||
          "/placeholder.svg",
        category: product.category,
      })
    }
    toast({ description: `${product.name} ajouté au panier` })
  }

  const isOutOfStock = product.quantity <= cartQuantity
  const Slug = generateSlug(product.name, { includeBrand: product.brand })

  return (
    <div className={cn("group relative", className)}>
      <Link href={`/product/${product.id}-${Slug}`} className="block" onClick={onNavigateStart}>
        {/* Image container — fixed aspect ratio, no overflow */}
        <div className="relative">
          <div className="relative overflow-hidden rounded-xl bg-white aspect-[3/4]">
            {/* Loading skeleton */}
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 via-secondary/10 to-secondary/5 animate-pulse" />
            )}

            <Image
              src={
                product.hasColorVariants &&
                product.colorVariants &&
                product.colorVariants.length > 0
                  ? product.colorVariants[0].image || "/placeholder.svg"
                  : (product.images && product.images.length > 0
                      ? product.images[0]
                      : product.image) || "/placeholder.svg"
              }
              alt={product.name}
              fill
              className={cn(
                "object-cover transition-all duration-700 ease-out",
                "group-hover:scale-[1.06]",
                imageLoaded ? "opacity-100" : "opacity-0"
              )}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 14vw"
              onLoad={() => setImageLoaded(true)}
            />

            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Category badge — top left */}
            <span className="absolute top-2 left-2 z-10 text-[9px] uppercase tracking-wider text-muted-foreground bg-background/80 backdrop-blur-sm px-2 py-0.5 rounded-full border border-border/40">
              {product.category}
            </span>

            {/* Out of stock badge */}
            {isOutOfStock && (
              <div className="absolute top-2 right-2 z-10 bg-background/95 backdrop-blur-sm px-2.5 py-1 rounded-full shadow border border-border/50">
                <span className="text-[9px] uppercase tracking-wider font-semibold text-destructive">
                  Épuisé
                </span>
              </div>
            )}

            {/* Quick add — slides up from bottom */}
            {!isOutOfStock && !product.hasColorVariants && (
              <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-400 ease-out">
                <Button
                  onClick={handleAddToCart}
                  className={cn(
                    "w-full h-10 bg-background/95 backdrop-blur-sm hover:bg-primary text-foreground hover:text-primary-foreground",
                    "border border-border/50 rounded-full shadow-lg",
                    "transition-all duration-300",
                    "text-xs font-medium uppercase tracking-wide gap-1.5"
                  )}
                  variant="outline"
                >
                  <ShoppingBag className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">Ajouter</span>
                </Button>
              </div>
            )}
          </div>

          {/* Product info */}
          <div className="mt-3 space-y-1 px-0.5">
            {product.brand && (
              <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground/70 font-medium group-hover:text-primary/70 transition-colors duration-300">
                {product.brand}
              </p>
            )}

            <h3 className="font-serif text-sm leading-snug text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2 min-h-[2.25rem]">
              {product.name}
            </h3>

            {/* Price */}
            <div>
              {typeof product.promoPrice === "number" && product.promoPrice < product.price ? (
                <div className="flex items-baseline gap-1.5">
                  <span className="text-sm line-through text-muted-foreground/50">
                    {product.price.toFixed(2)}
                  </span>
                  <span className="text-base font-medium text-foreground tabular-nums">
                    {product.promoPrice.toFixed(2)}
                    <span className="ml-0.5 text-[10px] font-light text-muted-foreground">DT</span>
                  </span>
                </div>
              ) : (
                <div className="flex items-baseline gap-1">
                  <span className="text-base font-light text-foreground tabular-nums">
                    {product.price.toFixed(2)}
                  </span>
                  <span className="text-[10px] font-light text-muted-foreground">DT</span>
                </div>
              )}
            </div>

            {/* Color variants */}
            {product.hasColorVariants &&
              product.colorVariants &&
              product.colorVariants.length > 0 && (
                <div className="flex items-center gap-2 pt-0.5">
                  <div className="flex items-center gap-1">
                    {product.colorVariants.slice(0, 5).map((variant, index) => (
                      <div
                        key={index}
                        className="w-4 h-4 rounded-full border border-background shadow-sm ring-1 ring-border/40"
                        style={{ backgroundColor: variant.color || "#000000" }}
                        title={variant.colorName}
                      />
                    ))}
                    {product.colorVariants.length > 5 && (
                      <div className="w-4 h-4 rounded-full border border-background bg-secondary flex items-center justify-center ring-1 ring-border/40">
                        <span className="text-[8px] text-muted-foreground font-semibold">
                          +{product.colorVariants.length - 5}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
          </div>
        </div>
      </Link>
    </div>
  )
}