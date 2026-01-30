"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { AdminRouteGuard } from "@/components/admin/admin-route-guard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LoadingAnimation } from "@/components/ui/loading-animation"
import { useToast } from "@/hooks/use-toast"
import { getProducts } from "@/lib/services/product-service"
import type { Product } from "@/lib/models/models"
import { Package, Tag, DollarSign, Layers, Edit, Plus, AlertCircle, Search, X } from "lucide-react"

const getCreatedAtMillis = (product: Product): number => {
  const ts: any = product.createdAt
  if (!ts) return 0
  if (typeof ts._seconds === "number") return ts._seconds * 1000
  if (typeof ts.toMillis === "function") return ts.toMillis()
  return new Date(ts).getTime() || 0
}

function getStockStatus(quantity: number) {
  if (quantity > 10) {
    return {
      label: "En stock",
      className: "border-green-500 text-green-500 bg-green-500/5",
      icon: "✓"
    }
  } else if (quantity > 0) {
    return {
      label: "Stock faible",
      className: "border-orange-500 text-orange-500 bg-orange-500/5",
      icon: "⚠"
    }
  } else {
    return {
      label: "Rupture de stock",
      className: "border-destructive text-destructive bg-destructive/5",
      icon: "✕"
    }
  }
}

function getProductImage(product: Product): string {
  if (product.hasColorVariants && product.colorVariants && product.colorVariants.length > 0) {
    return product.colorVariants[0].image || "/placeholder.svg"
  }
  if (product.images && product.images.length > 0) {
    return product.images[0]
  }
  return product.image || "/placeholder.svg"
}

export default function AdminProductsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const data = await getProducts()
      const sorted = [...data].sort((a, b) => getCreatedAtMillis(b) - getCreatedAtMillis(a))
      setProducts(sorted)
    } catch (err) {
      console.error(err)
      toast({ title: "Erreur", description: "Impossible de charger les produits.", variant: "destructive" })
    } finally { setLoading(false) }
  }

  // Filter products by name
  const filteredProducts = products.filter((product) => {
    const query = searchQuery.toLowerCase().trim()
    if (!query) return true
    return product.name.toLowerCase().includes(query)
  })

  if (loading) {
    return (
      <div className="h-screen bg-background z-40 flex items-center justify-center w-full">
        <LoadingAnimation size={140} className="text-primary" />
      </div>
    )
  }

  return (
    <AdminRouteGuard>
      <div className="min-h-screen bg-background p-4 w-full lg:w-10/12">
        <div className="relative border border-border/50 bg-gradient-to-br from-secondary/30 via-secondary/20 to-background rounded-3xl overflow-hidden min-h-[calc(100vh-2rem)]">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
          
          <main className="container relative mx-auto py-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <h1 className="font-serif text-3xl md:text-4xl font-medium tracking-tight mb-2">Produits</h1>
                <p className="text-muted-foreground">Gérer l'inventaire de la boutique</p>
              </div>
              <Button 
                onClick={() => router.push('/admin/products/new')} 
                className="rounded-full shadow-sm hover:shadow-md transition-all"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un Produit
              </Button>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative  ">
                
                <Input
                  type="text"
                  placeholder="Rechercher par nom..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-9 rounded-full bg-background/50 backdrop-blur-sm border-primary transition-all"
                /><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              {searchQuery && (
                <p className="text-sm text-muted-foreground mt-2">
                  {filteredProducts.length} produit{filteredProducts.length !== 1 ? 's' : ''} trouvé{filteredProducts.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>

            {filteredProducts.length === 0 ? (
              <Card className="bg-background/50 backdrop-blur-sm border-border/50 shadow-sm">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Package className="h-16 w-16 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground text-lg">
                    {searchQuery ? "Aucun produit ne correspond à votre recherche" : "Aucun produit trouvé"}
                  </p>
                  {!searchQuery && (
                    <Button 
                      onClick={() => router.push('/admin/products/new')} 
                      variant="outline"
                      className="mt-4 rounded-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter votre premier produit
                    </Button>
                  )}
                  {searchQuery && (
                    <Button 
                      onClick={() => setSearchQuery("")} 
                      variant="outline"
                      className="mt-4 rounded-full"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Effacer la recherche
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product.quantity)
                  const productImage = getProductImage(product)
                  
                  return (
                    <Card key={product.id} className="bg-background/50 backdrop-blur-sm border-border/50 shadow-sm hover:shadow-md transition-all duration-300 group overflow-hidden">
                      <CardContent className="p-6">
                        <div className="space-y-4 w-full flex flex-col justify-center ">
                          {/* Header */}
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="text-xs text-muted-foreground mb-1">
                                #{product.id.slice(0, 8)}
                              </div>
                              <h3 className="font-serif text-lg font-medium leading-tight mb-2 group-hover:text-primary transition-colors">
                                {product.name}
                              </h3>
                            </div>
                            <Badge
                              variant="outline"
                              className={`rounded-full px-3 py-1 text-xs ${stockStatus.className}`}
                            >
                              {stockStatus.label}
                            </Badge>
                          </div>

                          {/* Image + Details */}
                          <div className="flex gap-4 items-start justify-around w-full ">
                            {/* Image */}
                            <div className="relative aspect-[3/4] overflow-hidden  flex items-center justify-center   bg-white rounded-lg">
                              <div className="w-40 flex items-center justify-center">
                                <Image
                                src={productImage}
                                alt={product.name}
                                width={144}
                                height={192}
                                className="object-cover w-full h-full"
 
                                  />  
                              </div>
                            </div>


                            {/* Details */}
                            <div className="space-y-3 ">
                              <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                  <Tag className="h-4 w-4 text-primary" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs text-muted-foreground">Catégorie</p>
                                  <Badge
                                    variant="secondary"
                                    className="rounded-full font-normal text-xs mt-0.5 capitalize"
                                  >
                                    {product.category}
                                  </Badge>
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                  <DollarSign className="h-4 w-4 text-primary" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs text-muted-foreground">Prix</p>
                                  <p className="font-serif text-lg font-medium">
                                    {product.price.toFixed(2)} DT
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                  <Layers className="h-4 w-4 text-primary" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs text-muted-foreground">Stock disponible</p>
                                  <p className="font-medium">
                                    {product.quantity} {product.quantity === 1 ? "unité" : "unités"}
                                  </p>
                                </div>
                              </div>
                               <Button
                            variant="outline"
                            onClick={() => router.push(`/admin/products/edit/${product.id}`)}
                            className="w-full rounded-full text-primary border-primary  hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-all group-hover:shadow-sm"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Modifier le Produit
                          </Button>
                            </div>
                          </div>

                          {/* Action Button */}
                         
                        </div>
                      </CardContent>

                    </Card>
                  )
                })}
              </div>
            )}
          </main>
        </div>
      </div>
    </AdminRouteGuard>
  )
}