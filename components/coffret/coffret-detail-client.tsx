"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Coffret, Product } from "@/lib/models"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { useCart } from "@/components/cart-provider"
import { useToast } from "@/hooks/use-toast"
import { Breadcrumb } from "@/components/breadcrumb"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { 
  ShoppingBag, 
  Heart, 
  Share2, 
  Check,
  ChevronLeft,
  ChevronRight,

  Minus,
  Plus,
  Gift,
  
} from "lucide-react"
import { CoffretCard } from "./coffret-card"
import { cn } from "@/lib/utils"
import { generateSlug } from "@/lib/product-url"
import "../../app/coffrets/coffret-hearts.css"
import { useSaintValentin } from "./saint-valentin-provider"
interface CoffretDetailClientProps {
  coffret: Coffret
  products: Product[]
    onNavigateStart?: () => void
  relatedCoffrets: Coffret[]
}

export function CoffretDetailClient({ 
  coffret, 
  products,
  relatedCoffrets,
  onNavigateStart
  
}: CoffretDetailClientProps) {
  const { items, addItem, updateQuantity } = useCart()
  const { toast } = useToast()
  
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [thumbnailStartIndex, setThumbnailStartIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const { saintValentin } = useSaintValentin();
  const coffretImages = coffret.images && coffret.images.length > 0 
    ? coffret.images 
    : ["/placeholder.svg"]
  
  const displayImage = coffretImages[selectedImageIndex] || coffretImages[0]

  const hasDiscount = coffret.originalPrice && coffret.originalPrice > coffret.price
  const discountPercentage = hasDiscount 
    ? Math.round(((coffret.originalPrice! - coffret.price) / coffret.originalPrice!) * 100)
    : 0


  // Calculate cart quantity
  const cartQuantity = items
    .filter((item) => item.id === coffret.id)
    .reduce((sum, item) => sum + item.quantity, 0)

  const remainingStock = (coffret.stock || 0) - cartQuantity
  const inStock = remainingStock > 0

  // Reset image loaded state when image changes
  useEffect(() => {
    setImageLoaded(false)
  }, [displayImage])

  // Thumbnail navigation
  const THUMBNAILS_VISIBLE = 3
  const maxThumbnailStart = Math.max(0, coffretImages.length - THUMBNAILS_VISIBLE)
  const canScrollLeft = selectedImageIndex > 0
  const canScrollRight = selectedImageIndex < coffretImages.length - 1

  const syncSelectionWithThumbnails = (nextIndex: number) => {
    const middlePosition = Math.floor(THUMBNAILS_VISIBLE / 2)
    const clampedIndex = Math.min(Math.max(0, nextIndex), coffretImages.length - 1)

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
  const handleNavigationClick = () => {
    onNavigateStart?.()
  }
  const scrollThumbnailsRight = () => {
    if (canScrollRight) {
      syncSelectionWithThumbnails(selectedImageIndex + 1)
    }
  }

  const handleThumbnailClick = (index: number) => {
    syncSelectionWithThumbnails(index)
  }

  // Add to cart handler
  const handleAddToCart = async () => {
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

    const existingItem = items.find((item) => item.id === coffret.id)
    if (existingItem) {
      updateQuantity(coffret.id, existingItem.quantity + quantity)
    } else {
      addItem({
        id: coffret.id,
        name: coffret.name,
        price: coffret.price,
        image: displayImage,
        category: "Coffret",
      })
      if (quantity > 1) {
        updateQuantity(coffret.id, quantity)
      }
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

    setIsAdding(false)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: coffret.name,
          text: coffret.description,
          url: window.location.href,
        })
      } catch (err) {
        console.log("Share cancelled")
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast({
        description: "Lien copié dans le presse-papiers!",
      })
    }
  }

  const totalValue = products.reduce((sum, product) => sum + (product.price || 0), 0)
  const savings = totalValue - coffret.price

  // Breadcrumb
  const breadcrumbItems = [
    { name: "Coffrets", href: "/coffrets" },
    { name: coffret.name, href: "#", current: true }
  ]

  return (
       <>
      {saintValentin ? (
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {[...Array(8)].map((_, i) => {
          const colors = ['#FF0055', '#0066FF', '#FFCC00', '#00D9FF', '#FF00CC', '#7B61FF', '#FF6B00', '#00FF88']
          const sizes = [60, 45, 50, 55, 40, 30, 35, 38]
          const heartPositions = [
            { left: '10%', top: '15%' },
            { right: '15%', top: '25%' },
            { left: '80%', top: '60%' },
            { left: '5%', top: '70%' },
            { right: '20%', top: '75%' },
            { left: '25%', top: '35%' },
            { right: '35%', top: '45%' },
            { left: '60%', top: '20%' }
          ]
          
          return (
            <div 
              key={i}
              className={`coffret-heart coffret-heart-${i + 1}`}
              style={heartPositions[i]}
            >
              <svg width={sizes[i]} height={sizes[i]} viewBox="0 0 24 24" fill="none">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill={colors[i]}/>
              </svg>
            </div>
          )
        })}
      </div> ) : null}
    <div className="min-h-screen">
      <main className="container mx-auto px-4 lg:px-8 py-8 lg:py-16">
        <Breadcrumb items={breadcrumbItems} className="mb-8" />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 xl:gap-32">
          {/* Left Column: Image Gallery */}
          <div className="relative">
            <div className="lg:sticky lg:top-24 space-y-6">
              {/* Main Image */}
               <Badge 
                    variant="sticker" 
                    className="absolute top-4 -left-4  py-1 scale-125 shadow-lg"
                  >
                    -{discountPercentage}%
                  </Badge>
                
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-50 rounded-sm">
                
                 
              
                

                {!imageLoaded && (
                                    <div className="absolute inset-0 bg-gradient-to-br from-zinc-100 via-zinc-50 to-white animate-pulse" />
                                )}

                <div className="w-full h-full flex items-center justify-center bg-white">
                  <Image
                    src={displayImage}
                    alt={`${coffret.name} - Image ${selectedImageIndex + 1}`}
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

                {coffretImages.length > 1 && (
                  <div className="absolute bottom-6 right-6 backdrop-blur-sm text-zinc-900 text-xs px-3 py-1.5 rounded-full font-light tracking-wider">
                    {selectedImageIndex + 1} / {coffretImages.length}
                  </div>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {coffretImages.length > 1 && (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={scrollThumbnailsLeft}
                    disabled={!canScrollLeft}
                    className={cn(
                      "flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-sm border transition-all",
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
                      {coffretImages
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
                                alt={`${coffret.name} - Thumbnail ${actualIndex + 1}`}
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
            </div>
          </div>

          {/* Right Column: Product Details */}
          <div className="space-y-8">
                        {/* Value Proposition */}
            {savings > 0 && saintValentin && (
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-zinc-600 mb-1">
                        Valeur totale des produits
                      </p>
                      <p className="text-2xl font-medium text-primary">
                        Économisez {savings.toFixed(2)} TND
                      </p>
                    </div>
                    <Gift className="h-12 w-12 text-primary" />
                  </div>
                </CardContent>
              </Card>
            )}
              <div className="flex items-start justify-between gap-4 mb-3">
                <h1 className="font-light text-4xl md:text-4xl text-primary lg:text-6xl leading-[1.1] tracking-tight">
                                {coffret.name}
                            </h1>
                

              </div>

            {/* Price */}
            <div className="flex items-end gap-3">
              <div className="text-3xl md:text-4xl font-light tabular-nums">
                {coffret.price.toFixed(2)} <span className="text-base  font-light">DT</span>
              </div>
              {hasDiscount && (
                <div className="text-2xl text-zinc-400 line-through mb-1 font-light tabular-nums">
                  {coffret.originalPrice!.toFixed(2)} DT
                </div>
              )}
            </div>



            <Separator />

            {/* Quantity Selector */}
            <div className="space-y-6">
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
                                                className="h-12 w-12 hover:bg-primary rounded-l-sm rounded-r-none transition-colors"
                                            >
                                                <Minus className="h-3 w-3" />
                                            </Button>
                                            <span className="w-16 text-center text-sm font-light tabular-nums">{quantity}</span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setQuantity(Math.min(remainingStock, quantity + 1))}
                                                className="h-12 w-12 hover:bg-primary rounded-r-sm rounded-l-none transition-colors"
                                                disabled={quantity >= remainingStock}
                                            >
                                                <Plus className="h-3 w-3" />
                                            </Button>
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-xs font-light">
                                                Total:{(coffret.price * quantity).toFixed(2)} DT
                                            </div>
                                        </div>
                                    </div>
                                </div>

              {/* Add to Cart Button */}
                                          <div className="flex flex-row gap-2 w-full">

                                          <Button
                                onClick={handleAddToCart}
                                className={cn(
                                    "w-11/12 h-14 text-[11px] uppercase tracking-[0.2em] rounded-sm transition-all duration-300 font-light",
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
                                <Button
                    variant="outline"
                    size="icon"
                    onClick={handleShare}
                    className="w-1/12 rounded-sm h-14 text-[11px] uppercase tracking-[0.2em] font-light transition-all duration-300"
                  >
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
            </div>

            {/* Accordion Details */}
                                    <div className="pt-10 border-t border-zinc-100 animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: "300ms" }}>

                            <Accordion defaultValue="products" type="single" className="w-full">
              <AccordionItem  value="products" className="border-none">
                                        <AccordionTrigger className="text-xs uppercase tracking-[0.2em] font-light hover:no-underline py-6 border-b border-zinc-200 hover:border-zinc-400 transition-colors [&[data-state=open]]:border-zinc-400">
                                            <span className="flex items-center gap-3">
<span className="w-1 h-1 rounded-full bg-zinc-400"></span>                  Produits inclus ({products.length}) </span>
                </AccordionTrigger>
                                        <AccordionContent className="pt-6 pb-4 leading-relaxed font-light text-sm whitespace-pre-wrap">
                  <div className="space-y-4 pt-2">
                   {products.map((product) => {
  const slug = generateSlug(product.name, {
    includeBrand: product.brand,
  })

  return (
    <Link
      key={product.id}
      href={`/product/${product.id}-${slug}`}
      onClick={handleNavigationClick}
      className="flex gap-4 p-4 rounded-sm border border-zinc-100 hover:border-zinc-200 transition-colors"
    >
      {product.images?.[0] && (
        <div className="relative w-20 h-20 rounded-sm overflow-hidden flex-shrink-0 bg-zinc-50">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover"
            sizes="80px"
          />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm mb-1 line-clamp-1">
          {product.name}
        </h4>

        {product.description && (
          <p className="text-xs text-zinc-500 line-clamp-2">
            {product.description}
          </p>
        )}

        {product.price && (
          <p className="text-sm font-medium text-primary mt-2">
            {product.price.toFixed(2)} DT
          </p>
        )}
      </div>
    </Link>
  )
})}

                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="details" className="border-none" >
                                        <AccordionTrigger className="text-xs uppercase tracking-[0.2em] font-light hover:no-underline py-6 border-b border-zinc-200 hover:border-zinc-400 transition-colors [&[data-state=open]]:border-zinc-400">
                 <span className="flex items-center gap-3">
<span className="w-1 h-1 rounded-full bg-zinc-400"></span>   Détails du coffret </span>
                </AccordionTrigger>
                                        <AccordionContent className="pt-6 pb-4 leading-relaxed font-light text-sm whitespace-pre-wrap">
                  <div className="space-y-4 pt-2 text-sm text-zinc-600">
                    <div>
                      <h4 className="uppercase tracking-[0.2em] font-light text-xs text-zinc-900 mb-2">Description</h4>
                      <p className="leading-relaxed font-light text-sm whitespace-pre-wrap">
                        {coffret.description || "Un ensemble soigneusement sélectionné pour offrir ou se faire plaisir."}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="uppercase tracking-[0.2em] font-light text-xs text-zinc-900 mb-2">Composition</h4>
                      <ul className="space-y-1">
                        {products.map(product => (
                          <li key={product.id} className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>{product.name}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {savings > 0 && (
                      <div>
                        <h4 className="uppercase tracking-[0.2em] font-light text-xs text-zinc-900 mb-2">Avantages</h4>
                        <ul className="space-y-1">
                          <li className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>Économisez {savings.toFixed(2)} DT par rapport à l'achat séparé</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>Packaging cadeau élégant inclus</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>Idéal pour offrir ou découvrir nos produits</span>
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>

            </Accordion>
            </div>
          </div>
        </div>

        {/* Related Coffrets */}
        {relatedCoffrets.length > 0 && (
          <section className="mt-24">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-2xl lg:text-3xl font-serif font-medium">
                Coffrets similaires
              </h2>
              <Button variant="ghost" asChild className="hidden sm:inline-flex">
                <Link href="/coffrets">
                  Voir tout
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedCoffrets.map((relatedCoffret) => (
                <CoffretCard
                  key={relatedCoffret.id}
                  coffret={relatedCoffret}
                  aspectRatio="portrait"
                />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
    </>)
}