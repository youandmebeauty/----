"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useCart } from "./cart-provider"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

interface Product {
  id: string
  name: string
  price: number
  image: string
  category: string
  description: string
  stock: number
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
    e.preventDefault() // Prevent navigation if clicking the button
    e.stopPropagation()

    const remainingStock = product.stock - cartQuantity
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

  const isOutOfStock = product.stock <= cartQuantity

  return (
    <div className={cn("group relative flex flex-col space-y-4", className)}>
      {/* Image Container */}
      <Link href={`/product/${product.id}`} className="block relative aspect-[4/5] overflow-hidden bg-secondary/20">
        <Image
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          fill
          className="rounded-xl object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Overlay / Quick Action */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Stock Badge (Minimal) */}
        {isOutOfStock && (
          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 text-[10px] uppercase tracking-widest font-medium text-destructive">
            Sold Out
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-col space-y-1">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              {product.category}
            </span>
            <Link href={`/product/${product.id}`}>
              <h3 className="font-serif text-lg leading-tight text-foreground group-hover:text-primary transition-colors duration-300">
                {product.name}
              </h3>
            </Link>
          </div>
          <span className="text-sm font-medium text-foreground tabular-nums">
            {product.price.toFixed(2)} TND
          </span>
        </div>

        {/* Description - Optional, kept minimal */}
        <p className="text-xs text-muted-foreground line-clamp-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500 h-4">
          {product.description}
        </p>

        {/* Add to Cart Button - Appears on hover or always visible but subtle */}
        <div className="pt-2 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
          <Button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            variant="outline"
            className="w-full rounded-none border-foreground/20 hover:bg-foreground hover:text-background hover:border-foreground transition-all duration-300 h-9 text-xs uppercase tracking-widest"
          >
            {isOutOfStock ? "Rupture de stock" : "Ajouter au panier"}
          </Button>
        </div>
      </div>
    </div>
  )
}