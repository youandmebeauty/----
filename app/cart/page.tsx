"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useCart } from "@/components/cart-provider"
import { useToast } from "@/hooks/use-toast"
import { createOrder } from "@/lib/services/order-service"
import { getProductById } from "@/lib/services/product-service"
import type { OrderItem } from "@/lib/models"
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react"

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, total, isLoading } = useCart()
  const { toast } = useToast()
  const router = useRouter()
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [productStocks, setProductStocks] = useState<{ [id: string]: number }>({})
  const [orderForm, setOrderForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
    notes: "",
  })

  // Fetch stock for all products in the cart
  useEffect(() => {
    const fetchStocks = async () => {
      const stocks: { [id: string]: number } = {}
      for (const item of items) {
        try {
          const product = await getProductById(item.id)
          stocks[item.id] = typeof product?.stock === 'number' && product.stock >= 0 ? product.stock : 0
        } catch (error) {
          console.error(`Error fetching stock for product ${item.id}:`, error)
          stocks[item.id] = 0 // Default to 0 if fetch fails
        }
      }
      setProductStocks(stocks)
    }

    if (items.length > 0) {
      fetchStocks()
    }
  }, [items])

  const handleQuantityChange = (id: string, newQuantity: number) => {
    const item = items.find((item) => item.id === id)
    if (!item) return

    const stock = productStocks[id] ?? 0

    // Validate stock only for increases
    if (newQuantity > item.quantity && newQuantity > stock) {
      toast({
        title: "Erreur",
        description: `Impossible de définir la quantité à ${newQuantity}. Seulement ${stock} disponible.`,
        variant: "destructive",
      })
      return
    }

    // Handle decreases and removals
    try {
      updateQuantity(id, newQuantity)
    } catch (error) {
      console.error(`Error updating quantity for item ${id}:`, error)
      toast({
        title: "Erreur",
        description: "Échec de la mise à jour de la quantité. Veuillez réessayer.",
        variant: "destructive",
      })
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setOrderForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCheckingOut(true)

    try {
      // Validate stock before submitting order
      for (const item of items) {
        const stock = productStocks[item.id] ?? 0
        if (item.quantity > stock) {
          throw new Error(`Stock insuffisant pour ${item.name}. Seulement ${stock} disponible.`)
        }
      }

      const orderItems: OrderItem[] = items.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      }))

      const finalTotal = total > 100 ? total : total + 8

      await createOrder({
        customerName: orderForm.name,
        email: orderForm.email,
        phone: orderForm.phone,
        address: orderForm.address,
        city: orderForm.city,
        postalCode: orderForm.postalCode,
        country: orderForm.country,
        notes: orderForm.notes,
        items: orderItems,
        total: finalTotal,
      })

      toast({
        title: "Commande soumise avec succès!",
        description: "Vous recevrez un email de confirmation sous peu.",
      })

      clearCart()
      router.push("/order-confirmation")
    } catch (error) {
      console.error("Error submitting order:", error)
      toast({
        title: "Erreur lors de la soumission de la commande",
        description: error instanceof Error ? error.message : "Veuillez réessayer plus tard.",
        variant: "destructive",
      })
    } finally {
      setIsCheckingOut(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">

        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </main>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">

        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="flex justify-center mb-6">
              <ShoppingBag className="h-24 w-24 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Panier d'Achat</h1>
            <p className="text-muted-foreground mb-8 text-lg">Votre panier est vide</p>
            <Button asChild size="lg">
              <a href="/shop">Continuer les Achats</a>
            </Button>
          </div>
        </main>
      </div>
    )
  }

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30">

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <ShoppingBag className="h-8 w-8 mr-3 text-primary" />
          <h1 className="text-3xl font-bold">Panier d'Achat</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <div className="mb-6">
              <p className="text-muted-foreground">
                {itemCount} {itemCount === 1 ? "article" : "articles"} sous-total
              </p>
            </div>

            {items.map((item) => {
              const stock = productStocks[item.id] ?? 0
              return (
                <Card key={item.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted">
                          <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                        </div>
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold truncate mb-1">{item.name}</h3>
                        <p className="text-sm text-muted-foreground capitalize mb-2">{item.category}</p>
                        <p className="text-lg font-bold text-primary">{item.price.toFixed(2)} TND</p>
                        {/* Stock Status */}
                        <p className="text-xs text-muted-foreground">
                          {item.quantity <= stock ? (
                            `${stock - item.quantity} disponible`
                          ) : (
                            <span className="text-destructive">Dépasse le stock ({stock} disponible)</span>
                          )}
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex flex-col items-center space-y-3">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-12 text-center font-medium">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            disabled={item.quantity >= stock}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          className="text-destructive hover:text-destructive h-8"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Supprimer
                        </Button>
                      </div>

                      {/* Item Total */}
                      <div className="text-right">
                        <p className="text-xl font-bold">{(item.price * item.quantity).toFixed(2)} TND</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Order Summary & Checkout Form */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  Résumé de la Commande
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-base">
                  <span>
                    Sous-total ({itemCount} {itemCount === 1 ? "article" : "articles"})
                  </span>
                  <span className="font-medium">{total.toFixed(2)} TND</span>
                </div>
                <div className="flex justify-between text-base">
                  <span>Livraison</span>
                  <span className="font-medium">
                    {total > 100 ? (
                      <span className="text-green-600">Gratuit</span>
                    ) : (
                      "8.00 TND"
                    )}
                  </span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span className="text-primary">
                      {(total > 100 ? total : total + 8).toFixed(2)} TND
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Checkout Form */}
            <Card>
              <CardHeader>
                <CardTitle>Informations de Commande</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitOrder} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label htmlFor="name">
                        Nom Complet <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        value={orderForm.name}
                        onChange={handleInputChange}
                        required
                        placeholder="Nom Complet"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">
                        Email <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={orderForm.email}
                        onChange={handleInputChange}
                        required
                        placeholder="votre.email@exemple.com"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phone">
                      Téléphone <span className="text-muted-foreground">(optionnel)</span>
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={orderForm.phone}
                      onChange={handleInputChange}
                      placeholder="+216 93 220 902"
                    />
                  </div>

                  <div>
                    <Label htmlFor="address">
                      Adresse <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="address"
                      name="address"
                      value={orderForm.address}
                      onChange={handleInputChange}
                      required
                      placeholder="123 Rue de la Beauté"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">
                        Ville <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="city"
                        name="city"
                        value={orderForm.city}
                        onChange={handleInputChange}
                        required
                        placeholder="Paris"
                      />
                    </div>
                    <div>
                      <Label htmlFor="postalCode">
                        Code Postal <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="postalCode"
                        name="postalCode"
                        value={orderForm.postalCode}
                        onChange={handleInputChange}
                        required
                        placeholder="75001"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="country">
                      Pays <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="country"
                      name="country"
                      value={orderForm.country}
                      onChange={handleInputChange}
                      required
                      placeholder="France"
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes de Commande (Optionnel)</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      value={orderForm.notes}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Instructions spéciales pour votre commande..."
                    />
                  </div>

                  <Button type="submit" className="w-full" size="lg" disabled={isCheckingOut}>
                    {isCheckingOut ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                        Traitement de la Commande...
                      </>
                    ) : (
                      `Passer la Commande - ${(total > 100 ? total : total + 8).toFixed(2)} TND`
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center mt-4">
                    <span className="text-destructive">*</span> = requis
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}