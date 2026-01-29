"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AdminRouteGuard } from "@/components/admin/admin-route-guard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LoadingAnimation } from "@/components/ui/loading-animation"
import { useToast } from "@/hooks/use-toast"
import { getProducts } from "@/lib/services/product-service"
import type { Product } from "@/lib/models/models"

const getCreatedAtMillis = (product: Product): number => {
  const ts: any = product.createdAt
  if (!ts) return 0
  if (typeof ts._seconds === "number") return ts._seconds * 1000
  if (typeof ts.toMillis === "function") return ts.toMillis()
  return new Date(ts).getTime() || 0
}

export default function AdminProductsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const data = await getProducts()
      const sorted = [...data].sort((a,b) => getCreatedAtMillis(b) - getCreatedAtMillis(a))
      setProducts(sorted)
    } catch (err) {
      console.error(err)
      toast({ title: "Erreur", description: "Impossible de charger les produits.", variant: "destructive" })
    } finally { setLoading(false) }
  }
  if (loading) {
    return (
      <div className=" h-screen bg-background z-40 flex items-center justify-center">
        <LoadingAnimation size={140} className="text-primary" />
      </div>
    )
  }
  return (
    <AdminRouteGuard>
      <div className="min-h-screen bg-background p-4">
        <div className="container mx-auto">
          <Card className="bg-background/50 backdrop-blur-sm border-border/50 shadow-sm overflow-hidden">
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="font-serif text-xl">Inventaire des Produits</CardTitle>
              <Button onClick={() => router.push('/admin/products/new')} className="rounded-full">Ajouter un Produit</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border/50">
                    <TableHead>ID Produit</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Prix</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.length > 0 ? products.map((product) => (
                    <TableRow key={product.id} className="hover:bg-primary/5 border-border/50 transition-colors">
                      <TableCell className="font-medium">#{product.id.slice(0,6)}</TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell className="capitalize"><Badge variant="secondary" className="rounded-full font-normal">{product.category}</Badge></TableCell>
                      <TableCell>{product.price.toFixed(2)} DT</TableCell>
                      <TableCell>{product.quantity}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`rounded-full px-3 py-1 ${product.quantity > 10 ? "border-green-500 text-green-500 bg-green-500/5" : product.quantity > 0 ? "border-orange-500 text-orange-500 bg-orange-500/5" : "border-destructive text-destructive bg-destructive/5"}`}>
                          {product.quantity > 10 ? "En stock" : product.quantity > 0 ? "Stock faible" : "Rupture de stock"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => router.push(`/admin/products/edit/${product.id}`)} className="hover:bg-primary/10 hover:text-primary">Modifier</Button>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Aucun produit trouvé</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminRouteGuard>
  )
}
