"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AdminRouteGuard } from "@/components/admin/admin-route-guard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LoadingAnimation } from "@/components/ui/loading-animation"
import { useToast } from "@/hooks/use-toast"
import { getOrders, updateOrderStatus } from "@/lib/services/order-service"
import type { Order } from "@/lib/models/models"
import { Package, Mail, User, Calendar, Tag, DollarSign, ChevronRight } from "lucide-react"

function getStatusColor(status: Order["status"]) {
  switch (status) {
    case "pending": return "border-yellow-500 text-yellow-500 bg-yellow-500/5"
    case "processing": return "border-blue-500 text-blue-500 bg-blue-500/5"
    case "shipped": return "border-orange-500 text-orange-500 bg-orange-500/5"
    case "delivered": return "border-green-500 text-green-500 bg-green-500/5"
    case "cancelled": return "border-red-500 text-red-500 bg-red-500/5"
    default: return "border-gray-500 text-gray-500 bg-gray-500/5"
  }
}

function getStatusLabel(status: Order["status"]) {
  switch (status) {
    case "pending": return "En attente"
    case "processing": return "En traitement"
    case "shipped": return "Expédié"
    case "delivered": return "Livré"
    case "cancelled": return "Annulé"
    default: return status
  }
}

export default function AdminOrdersPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const data = await getOrders()
      setOrders(data)
    } catch (err) {
      console.error(err)
      toast({ title: "Erreur", description: "Impossible de charger les commandes.", variant: "destructive" })
    } finally { setLoading(false) }
  }

  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order["status"]) => {
    try {
      await updateOrderStatus(orderId, newStatus)
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)))
      toast({ title: "Commande mise à jour", description: `Statut changé en ${getStatusLabel(newStatus)}` })
    } catch (err) {
      toast({ title: "Erreur", description: "Échec de la mise à jour.", variant: "destructive" })
    }
  }

  if (loading) {
    return (
      <div className="h-screen w-full z-40 bg-background flex items-center justify-center">
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
            <div className="mb-8">
              <h1 className="font-serif text-3xl md:text-4xl font-medium tracking-tight mb-2">Commandes</h1>
              <p className="text-muted-foreground">Gérer toutes les commandes de la boutique</p>
            </div>

            {orders.length === 0 ? (
              <Card className="bg-background/50 backdrop-blur-sm border-border/50 shadow-sm">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Package className="h-16 w-16 text-muted-foreground  mb-4" />
                  <p className="text-muted-foreground text-lg">Aucune commande trouvée</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {orders.map((order) => (
                  <Card key={order.id} className="bg-background/50 backdrop-blur-sm border-border/50 shadow-sm hover:shadow-md transition-all duration-300 group">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        {/* Left Section - Order Info */}
                        <div className="flex-1 space-y-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-serif text-xl font-medium">#{order.id.slice(0, 8)}</h3>
                                <Badge variant="outline" className={`rounded-full px-3 py-1 ${getStatusColor(order.status)}`}>
                                  {getStatusLabel(order.status)}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>{new Date((order?.createdAt as any)?.toDate?.() ?? order?.createdAt).toLocaleString('fr-FR')}</span>
                              </div>
                            </div>
                          </div>

                          {/* Customer & Order Details Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Client</p>
                                <p className="font-medium">{order.customerName}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <Mail className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Email</p>
                                <p className="font-medium text-sm">{order.email}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <DollarSign className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Total</p>
                                <div className="font-medium font-serif text-lg">{order.total.toFixed(2)} DT</div>
                                {order.discount && order.discount > 0 && (
                                  <p className="text-xs text-green-600">-{order.discount.toFixed(2)} DT remise</p>
                                )}
                              </div>
                            </div>

                            {order.promoCode && (
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                  <Tag className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Code Promo</p>
                                  <p className="font-medium">{order.promoCode}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right Section - Actions */}
                        <div className="flex flex-col gap-3 lg:items-end">
                          <Button 
                            variant="outline" 
                            onClick={() => router.push(`/admin/orders/${order.id}`)}
                            className="rounded-full border-border/50 hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-all group-hover:shadow-sm w-full lg:w-auto"
                          >
                            Voir Détails
                            <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
                          </Button>

                          <div className="w-full lg:w-64">
                            <label className="text-xs text-muted-foreground mb-1.5 block">Changer le statut</label>
                            <select 
                              value={order.status} 
                              onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as Order["status"])} 
                              className="w-full text-sm bg-background/80 backdrop-blur-sm border border-border/50 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            >
                              <option value="pending">En attente</option>
                              <option value="processing">En traitement</option>
                              <option value="shipped">Expédié</option>
                              <option value="delivered">Livré</option>
                              <option value="cancelled">Annulé</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </AdminRouteGuard>
  )
}