"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useCart } from "./cart-provider"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { ShoppingBag } from "lucide-react"
import { useState } from "react"
import { generateSlung } from "@/lib/product-url"

interface Product {
  id: string
  name: string
  brand?: string
  price: number
  image?: string
  images?: string[]
  category: string
  description: string
  quantity: number
  hasColorVariants?: boolean
  colorVariants?: Array<{
    colorName: string
    color?: string
    image: string
    quantity: number
  }>
}

interface ProductCardProps {
  product: Product
  className?: string
  onNavigateStart?: () => void
}

export function ProductCard({ product, className, onNavigateStart }: ProductCardProps) {
  const { items, addItem, updateQuantity } = useCart()
  const [imageLoaded, setImageLoaded] = useState(false)

  // Calculate the number of items of this product already in the cart
  const cartQuantity = items
    .filter((item) => item.id === product.id)
    .reduce((sum, item) => sum + item.quantity, 0)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // For products with color variants, redirect to product page to select color
    if (product.hasColorVariants && product.colorVariants && product.colorVariants.length > 0) {
      return // Let the link navigate to product page
    }


    const remainingStock = product.quantity - cartQuantity
    const quantityToAdd = 1

    if (quantityToAdd > remainingStock) {
      return
    }

    const existingItem = items.find((item) => item.id === product.id)
    if (existingItem) {
      updateQuantity(product.id, existingItem.quantity + quantityToAdd)
    } else {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: (product.images && product.images.length > 0 ? product.images[0] : product.image) || "/placeholder.svg",
        category: product.category,
      })
    }
    toast({
      description: `${product.name} ajouté au panier`,
    })
  }

  const handleNavigationClick = () => {
    onNavigateStart?.()
  }

  const isOutOfStock = product.quantity <= cartQuantity
const slung = generateSlung(product.name, { 
    includeBrand: product.brand 
  })
  return (
    <div className={cn("group relative", className)}>
      <Link 
        href={`/product/${slung}?id=${product.id}`}
        className="block"
        onClick={handleNavigationClick}
      >
        <div className="relative">
          {/* Image Container */}
          <div className="relative aspect-[3/4] overflow-hidden bg-secondary/10 rounded-lg">
            {/* Loading skeleton */}
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 via-secondary/10 to-secondary/5 animate-pulse" />
            )}
            
            <Image
              src={
                product.hasColorVariants && product.colorVariants && product.colorVariants.length > 0
                  ? product.colorVariants[0].image || "/placeholder.svg"
                  : (product.images && product.images.length > 0 ? product.images[0] : product.image) || "/placeholder.svg"
              }
              alt={product.name}
              fill
              className={cn(
                "object-cover transition-all duration-700 ease-out",
                "group-hover:scale-[1.08]",
                imageLoaded ? "opacity-100" : "opacity-0"
              )}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onLoad={() => setImageLoaded(true)}
            />

            {/* Multi-layer Gradient Overlay on Hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

            {/* Stock Badge */}
            {isOutOfStock && (
              <div className="absolute top-3 left-3 bg-background/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg border border-border/50">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-destructive">
                  Épuisé
                </span>
              </div>
            )}

            

            {/* Quick Add Button - Bottom */}
            {!isOutOfStock && !product.hasColorVariants && (
              <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out">
                <Button
                  onClick={handleAddToCart}
                  className={cn(
                    "w-full h-12 bg-background/95 backdrop-blur-sm hover:bg-primary text-foreground hover:text-primary-foreground",
                    "border border-border/50 rounded-full shadow-xl hover:shadow-2xl",
                    "transition-all duration-300 hover:scale-[1.02]",
                    "font-medium uppercase tracking-wide"
                  )}
                  variant="outline"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span className="text-xs truncate">Ajouter au panier</span>
                </Button>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="mt-4 space-y-2 px-1">
            {/* Brand */}
            {product.brand && (
              <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground/80 font-medium transition-colors duration-300 group-hover:text-primary/80">
                {product.brand}
              </p>
            )}

            {/* Product Name */}
            <h3 className="font-serif text-base leading-snug text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2 min-h-[2.5rem]">
              {product.name}
            </h3>

            {/* Price & Category */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-light text-foreground tabular-nums">
                  {product.price.toFixed(2)}
                </span>
                <span className="text-xs font-light text-muted-foreground">DT</span>
              </div>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60 bg-secondary/30 px-2 py-1 rounded-full">
                {product.category}
              </span>
            </div>

            {/* Color Variants Preview */}
            {product.hasColorVariants && product.colorVariants && product.colorVariants.length > 0 && (
              <div className="flex items-center  gap-2 ">
                <span className="text-[10px] text-muted-foreground/70 uppercase tracking-wider">Couleurs:</span>
                <div className="flex gap-1.5">
                  {product.colorVariants.slice(0, 5).map((variant, index) => (
                    <div
                      key={index}
                      className="relative w-6 h-6 -mr-4 z-10 rounded-full border-2 border-background shadow-sm"
                      style={{ backgroundColor: variant.color || "#000000" }}
                      title={variant.colorName}
                    />
                  ))}
                  {product.colorVariants.length > 5 && (
                    <div className="w-6 h-6 z-20 rounded-full border border-background bg-secondary flex items-center justify-center">
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