"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { AdminRouteGuard } from "@/components/admin-route-guard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { getOrderById, updateOrderStatus } from "@/lib/services/order-service"
import type { Order } from "@/lib/models"
import { ArrowLeft, Package, User, MapPin, Phone, Mail, AlertTriangle } from "lucide-react"
import { LoadingAnimation } from "@/components/ui/loading-animation"

function OrderDetailsContent() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchOrder(params.id as string)
    }
  }, [params.id])

  const fetchOrder = async (id: string) => {
    try {
      const orderData = await getOrderById(id)
      if (orderData) {
        setOrder(orderData)
      } else {
        toast({
          title: "Erreur",
          description: "Commande introuvable.",
          variant: "destructive",
        })
        router.push("/admin/dashboard")
      }
    } catch (error) {
      console.error("Error fetching order:", error)
      toast({
        title: "Erreur",
        description: "Échec du chargement de la commande.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (newStatus: Order["status"]) => {
    if (!order) return

    setUpdating(true)
    try {
      await updateOrderStatus(order.id, newStatus)
      setOrder((prev) => (prev ? { ...prev, status: newStatus } : null))
      
      const statusMessages: Record<Order["status"], string> = {
        pending: "En attente",
        processing: "En traitement",
        shipped: "Expédié",
        delivered: "Livré",
        cancelled: "Annulé (stock restauré)"
      }
      
      toast({
        title: "Commande mise à jour",
        description: `Statut de la commande changé en ${statusMessages[newStatus]}.`,
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Échec de la mise à jour du statut de la commande.",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "border-yellow-500 text-yellow-500 bg-yellow-500/5"
      case "processing":
        return "border-blue-500 text-blue-500 bg-blue-500/5"
      case "shipped":
        return "border-orange-500 text-orange-500 bg-orange-500/5"
      case "delivered":
        return "border-green-500 text-green-500 bg-green-500/5"
      case "cancelled":
        return "border-red-500 text-red-500 bg-red-500/5"
      default:
        return "border-gray-500 text-gray-500 bg-gray-500/5"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <LoadingAnimation size={140} className="text-primary" />
          </div>
        </main>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Commande introuvable</h1>
            <Button onClick={() => router.push("/admin/dashboard")}>Retour au tableau de bord</Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="relative border border-border/50 bg-gradient-to-br from-secondary/30 via-secondary/20 to-background rounded-3xl overflow-hidden min-h-[calc(100vh-2rem)]">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

        <main className="container relative mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <Button variant="ghost" onClick={() => router.back()} className="mr-4 hover:bg-primary/10 hover:text-primary rounded-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
              <h1 className="font-serif text-3xl font-medium tracking-tight">
                Détails de la commande #{order.id.slice(0, 8)}
              </h1>
            </div>
            <Badge variant="outline" className={`text-sm px-4 py-1.5 rounded-full ${getStatusColor(order.status)}`}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Items */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-background/50 backdrop-blur-sm border-border/50 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center font-serif text-xl">
                    <Package className="h-5 w-5 mr-2 text-primary" />
                    Articles de la commande
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4 p-4 border border-border/50 rounded-xl bg-background/50">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          width={60}
                          height={60}
                          className="rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold">{item.name}</h3>
                          <p className="text-sm text-muted-foreground">Quantité: {item.quantity}</p>
                          <p className="text-sm text-muted-foreground">{item.price.toFixed(2)} TND chacun</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{(item.price * item.quantity).toFixed(2)} TND</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-border/50 mt-6 pt-4 space-y-2">
                    {order.promoCode && order.discount && order.discount > 0 && (
                      <div className="flex justify-between text-base">
                        <span className="text-muted-foreground">Code promo ({order.promoCode}):</span>
                        <span className="text-green-600 font-medium">-{order.discount.toFixed(2)} TND</span>
                      </div>
                    )}
                    <div className="flex justify-between text-xl font-serif font-medium pt-2">
                      <span>Total:</span>
                      <span>{order.total.toFixed(2)} TND</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order Notes */}
              {order.notes && (
                <Card className="bg-background/50 backdrop-blur-sm border-border/50 shadow-sm">
                  <CardHeader>
                    <CardTitle className="font-serif text-xl">Notes de commande</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{order.notes}</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Order Info & Actions */}
            <div className="space-y-6">
              {/* Customer Information */}
              <Card className="bg-background/50 backdrop-blur-sm border-border/50 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center font-serif text-xl">
                    <User className="h-5 w-5 mr-2 text-primary" />
                    Informations client
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-background/50 border border-border/50">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{order.customerName}</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-background/50 border border-border/50">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{order.email}</span>
                  </div>
                  {order.phone && (
                    <div className="flex items-center space-x-3 p-3 rounded-lg bg-background/50 border border-border/50">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{order.phone}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Shipping Address */}
              <Card className="bg-background/50 backdrop-blur-sm border-border/50 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center font-serif text-xl">
                    <MapPin className="h-5 w-5 mr-2 text-primary" />
                    Adresse de livraison
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 p-4 rounded-lg bg-background/50 border border-border/50">
                    <p className="font-medium">{order.customerName}</p>
                    <p className="text-muted-foreground">{order.address}</p>
                    <p className="text-muted-foreground">
                      {order.city}, {order.postalCode}
                    </p>
                    <p className="text-muted-foreground">{order.gouvernorat}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Order Status */}
              <Card className="bg-background/50 backdrop-blur-sm border-border/50 shadow-sm">
                <CardHeader>
                  <CardTitle className="font-serif text-xl">Gestion du statut</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Statut actuel:</p>
                    <Badge variant="outline" className={`text-sm px-3 py-1 rounded-full ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Mettre à jour le statut:</p>
                    <div className="space-y-2">
                      {(["pending", "processing", "shipped", "delivered"] as const).map((status) => (
                        <Button
                          key={status}
                          variant={order.status === status ? "default" : "outline"}
                          size="sm"
                          className={`w-full justify-start rounded-full ${
                            order.status !== status ? "bg-background/50 border-border/50 hover:bg-primary/10 hover:text-primary" : ""
                          }`}
                          onClick={() => handleStatusUpdate(status)}
                          disabled={updating || order.status === status || order.status === "cancelled"}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Cancel Order Button */}
                  {order.status !== "cancelled" && (
                    <div className="pt-4 border-t border-border/50">
                      <Button
                        variant="destructive"
                        size="sm"
                        className="w-full rounded-full"
                        onClick={() => handleStatusUpdate("cancelled")}
                        disabled={updating}
                      >
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Annuler la commande
                      </Button>
                      <p className="text-xs text-muted-foreground mt-2 text-center">
                        Le stock sera automatiquement restauré
                      </p>
                    </div>
                  )}

                  <div className="pt-4 border-t border-border/50">
                    <p className="text-sm text-muted-foreground">
                      Date de commande:
                      <span className="ml-2 font-medium text-foreground">
                        {new Date(
                          (order?.createdAt as any)?.toDate?.() ?? order?.createdAt
                        ).toLocaleString()}
                      </span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default function OrderDetailsPage() {
  return (
    <AdminRouteGuard>
      <OrderDetailsContent />
    </AdminRouteGuard>
  )
}