"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useCart } from "./cart-provider"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { ShoppingBag } from "lucide-react"

interface Product {
  id: string
  name: string
  brand?: string
  price: number
  image: string
  category: string
  description: string
  quantity: number
}

interface ProductCardProps {
  product: Product
  className?: string
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { items, addItem, updateQuantity } = useCart()

  // Calculate the number of items of this product already in the cart
  const cartQuantity = items
    .filter((item) => item.id === product.id)
    .reduce((sum, item) => sum + item.quantity, 0)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

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
        image: product.image,
        category: product.category,
      })
    }
    toast({
      description: `${product.name} ajouté au panier`,
    })
  }

  const isOutOfStock = product.quantity <= cartQuantity

  return (
    <Link 
      href={`/product/${product.id}`}
      className={cn("group block", className)}
    >
      <div className="relative">
        {/* Image Container */}
        <div className="relative aspect-[3/4] overflow-hidden bg-secondary/10 rounded-sm">
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover transition-all duration-700 ease-out group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />

          {/* Gradient Overlay on Hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Stock Badge */}
          {isOutOfStock && (
            <div className="absolute top-3 left-3 bg-background/95 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-destructive">
                Épuisé
              </span>
            </div>
          )}

          {/* Quick Add Button - Appears on Hover */}
          {!isOutOfStock && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2  translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
              <Button
                onClick={handleAddToCart}
                className="h-11 bg-background/95 backdrop-blur-sm hover:bg-primary text-foreground border border-border/50 rounded-full shadow-lg"
                variant="outline"
              >
                <ShoppingBag className="h-4 w-4 md:mr-2 " />
                <span className="hidden md:block text-sm uppercase font-medium">Ajouter au panier</span>
              </Button>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="mt-4 space-y-2">
          {/* Brand */}
          {product.brand && (
            <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground/80 font-medium">
              {product.brand}
            </p>
          )}

          {/* Product Name */}
          <h3 className="font-serif text-base leading-snug text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2">
            {product.name}
          </h3>

          {/* Price & Category */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-sm font-semibold text-foreground tabular-nums">
              {product.price.toFixed(2)} <span className="text-xs font-normal">TND</span>
            </span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60">
              {product.category}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}