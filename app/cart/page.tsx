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
import { getItemStock } from "@/lib/services/product-service"
import { getPromoCodeByCode } from "@/lib/services/promo-code-service"
import type { OrderItem, PromoCode } from "@/lib/models"
import { Minus, Plus, Trash2, ShoppingBag, Tag, Check, X } from "lucide-react"

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, total, isLoading } = useCart()
  const { toast } = useToast()
  const router = useRouter()
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [productStocks, setProductStocks] = useState<{ [id: string]: number }>({})
  
  // Promo code state
  const [promoCode, setPromoCode] = useState("")
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null)
  const [promoError, setPromoError] = useState("")
  const [isValidatingPromo, setIsValidatingPromo] = useState(false)
  
  const [orderForm, setOrderForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    gouvernorat: "",
    notes: "",
  })

  // Fetch stock for all products in the cart (handles variants)
  useEffect(() => {
    const fetchStocks = async () => {
      const stocks: { [id: string]: number } = {}
      for (const item of items) {
        try {
          const stock = await getItemStock(item.id)
          stocks[item.id] = stock
        } catch (error) {
          console.error(`Error fetching stock for item ${item.id}:`, error)
          stocks[item.id] = 0
        }
      }
      setProductStocks(stocks)
    }

    if (items.length > 0) {
      fetchStocks()
    }
  }, [items])


  // Calculate discount based on applied promo
  const calculateDiscount = () => {
    if (!appliedPromo) return 0

    if (appliedPromo.minPurchase && total < appliedPromo.minPurchase) {
      return 0
    }

    if (appliedPromo.type === 'percentage') {
      return (total * appliedPromo.value) / 100
    } else {
      return appliedPromo.value
    }
  }

  // Calculate shipping cost (free if total > 200 or if FREESHIP promo is applied)
  const calculateShipping = () => {
    if (total > 200) return 0
    if (appliedPromo?.code === "FREESHIP") return 0
    return 8
  }

  const discount = calculateDiscount()
  const shipping = calculateShipping()
  const finalTotal = total - discount + shipping

  // Validate and apply promo code
  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      setPromoError("Veuillez entrer un code promo")
      return
    }

    setIsValidatingPromo(true)
    setPromoError("")

    try {
      const foundPromo = await getPromoCodeByCode(promoCode)

      if (!foundPromo) {
        setPromoError("Code promo invalide")
        setIsValidatingPromo(false)
        return
      }

      // Check if promo is active
      if (foundPromo.active === false) {
        setPromoError("Ce code promo n'est plus actif")
        setIsValidatingPromo(false)
        return
      }

      // Check expiry date
      const expiryDate = foundPromo.expiryDate 
        ? (typeof foundPromo.expiryDate === 'string' ? new Date(foundPromo.expiryDate) : foundPromo.expiryDate)
        : null
      if (expiryDate && new Date() > expiryDate) {
        setPromoError("Ce code promo a expiré")
        setIsValidatingPromo(false)
        return
      }

      // Check usage limit
      if (foundPromo.usageLimit && foundPromo.usedCount && foundPromo.usedCount >= foundPromo.usageLimit) {
        setPromoError("Ce code promo a atteint sa limite d'utilisation")
        setIsValidatingPromo(false)
        return
      }

      // Check minimum purchase
      if (foundPromo.minPurchase && total < foundPromo.minPurchase) {
        setPromoError(`Commande minimum de ${foundPromo.minPurchase} DT requise`)
        setIsValidatingPromo(false)
        return
      }

      setAppliedPromo(foundPromo)
      setPromoError("")
      setIsValidatingPromo(false)
      
      toast({
        title: "Code promo appliqué!",
        description: foundPromo.description || `Code ${foundPromo.code} appliqué avec succès`,
      })
    } catch (error) {
      console.error("Error validating promo code:", error)
      setPromoError("Erreur lors de la validation du code promo")
      setIsValidatingPromo(false)
    }
  }

  // Remove applied promo
  const handleRemovePromo = () => {
    setAppliedPromo(null)
    setPromoCode("")
    setPromoError("")
    toast({
      title: "Code promo retiré",
      description: "Le code promo a été retiré de votre commande",
    })
  }

  const handleQuantityChange = (id: string, newQuantity: number) => {
    const item = items.find((item) => item.id === id)
    if (!item) return

    const stock = productStocks[id] ?? 0

    if (newQuantity > item.quantity && newQuantity > stock) {
      toast({
        title: "Erreur",
        description: `Impossible de définir la quantité à ${newQuantity}. Seulement ${stock} disponible.`,
        variant: "destructive",
      })
      return
    }

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
      // Validate stock before submitting order (re-fetch to ensure accuracy)
      for (const item of items) {
        const stock = await getItemStock(item.id)
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

      const orderData: any = {
        customerName: orderForm.name,
        email: orderForm.email,
        phone: orderForm.phone || undefined,
        address: orderForm.address,
        city: orderForm.city,
        postalCode: orderForm.postalCode,
        gouvernorat: orderForm.gouvernorat,
        items: orderItems,
        total: finalTotal,
      }

      // Only include optional fields if they have values
      if (orderForm.notes) {
        orderData.notes = orderForm.notes
      }
      if (appliedPromo?.code) {
        orderData.promoCode = appliedPromo.code
      }
      if (discount > 0) {
        orderData.discount = discount
      }

      await createOrder(orderData)

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
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
          </div>
        </main>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="bg-background">
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
    <div className="min-h-screen bg-gradient-to-b from-secondary/30 to-background rounded-3xl m-4">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

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
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-4 sm:gap-6">
                      <div className="flex items-start gap-4 flex-1 min-w-0 w-full">
                        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-gradient-to-br from-muted/50 to-muted border shadow-xs hover:shadow-md transition-shadow duration-200 flex-shrink-0">
                          <Image
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            fill
                            sizes="(max-width: 640px) 80px, 96px"
                            className="object-cover hover:scale-105 transition-transform duration-300"
                            priority={false}
                          />
                        </div>

                        <div className="flex flex-col justify-between gap-1.5 sm:gap-2 min-w-0 flex-1">
                          <div className="space-y-1.5">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="text-base sm:text-lg font-semibold leading-tight line-clamp-2">
                                {item.name}
                              </h3>
                              <span className="text-sm font-semibold text-primary sm:hidden">
                                {item.price.toFixed(2)} DT
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="inline-flex items-center px-2 py-1 rounded-full bg-primary/10 text-xs font-medium text-primary capitalize">
                                {item.category}
                              </span>
                            </div>
                            
                            <p className="hidden sm:block text-sm font-semibold text-primary">
                              {item.price.toFixed(2)} DT chacun
                            </p>
                          </div>

                          <div className="sm:hidden w-full pt-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Button
                                  size="icon"
                                  variant="outline"
                                  className="h-8 w-8 rounded-md"
                                  onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                  disabled={item.quantity <= 1}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                
                                <span className="w-8 text-center font-semibold text-sm">
                                  {item.quantity}
                                </span>
                                
                                <Button
                                  size="icon"
                                  variant="outline"
                                  className="h-8 w-8 rounded-md"
                                  onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                  disabled={item.quantity >= stock}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive px-2 py-1 h-auto"
                                onClick={() => removeItem(item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="hidden sm:block h-20 w-px bg-border mx-2" />

                      <div className="hidden sm:flex flex-col items-end gap-3">
                        <div className="flex flex-col items-center gap-2 w-full">
                          <div className="flex items-center gap-3 justify-between w-full">
                            <div className="flex items-center gap-3">
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-9 w-9 rounded-md hover:bg-primary hover:text-primary-foreground transition-colors"
                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>

                              <span className="w-12 text-center font-semibold text-base">
                                {item.quantity}
                              </span>

                              <Button
                                size="icon"
                                variant="outline"
                                className="h-9 w-9 rounded-md hover:bg-primary hover:text-primary-foreground transition-colors"
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                disabled={item.quantity >= stock}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 w-full justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 px-3"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Supprimer
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Order Summary & Checkout Form */}
          <div className="space-y-6 relative z-10">

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
                  <span className="font-medium">{total.toFixed(2)} DT</span>
                </div>
                
                {discount > 0 && (
                  <div className="flex justify-between text-base text-green-600">
                    <span>Réduction ({appliedPromo?.code})</span>
                    <span className="font-medium">-{discount.toFixed(2)} DT</span>
                  </div>
                )}
                
                <div className="flex justify-between text-base">
                  <span>Livraison</span>
                  <span className="font-medium">
                    {shipping === 0 ? (
                      <span className="text-green-600">Gratuit</span>
                    ) : (
                      `${shipping.toFixed(2)} DT`
                    )}
                  </span>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span className="text-primary">{finalTotal.toFixed(2)} DT</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Promo Code Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-base">
                  <Tag className="h-5 w-5 mr-2" />
                  Code Promo
                </CardTitle>
              </CardHeader>
              <CardContent>
                {appliedPromo ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-semibold text-green-700 dark:text-green-400">
                            {appliedPromo.code}
                          </p>
                          {appliedPromo.description && (
                            <p className="text-xs text-green-600 dark:text-green-500">
                              {appliedPromo.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRemovePromo}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Entrez le code promo"
                        value={promoCode}
                        onChange={(e) => {
                          setPromoCode(e.target.value.toUpperCase())
                          setPromoError("")
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleApplyPromo()
                          }
                        }}
                        className={promoError ? "border-destructive" : ""}
                      />
                      <Button
                        onClick={handleApplyPromo}
                        disabled={!promoCode || isValidatingPromo}
                        className="whitespace-nowrap"
                      >
                        {isValidatingPromo ? (
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
          ) : (
                          "Appliquer"
                        )}
                      </Button>
                    </div>
                    {promoError && (
                      <p className="text-sm text-destructive">{promoError}</p>
                    )}
                  </div>
                )}
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
                        placeholder="Lafrane"
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
                        placeholder="3000"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="gouvernorat">
                      Gouvernorat <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="gouvernorat"
                      name="gouvernorat"
                      value={orderForm.gouvernorat}
                      onChange={handleInputChange}
                      required
                      placeholder="Sfax"
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
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
            Traitement de la Commande...
                      </>
                    ) : (
                      `Passer la Commande - ${finalTotal.toFixed(2)} DT`
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