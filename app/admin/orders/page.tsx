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
import { getOrders, updateOrderStatus } from "@/lib/services/order-service"
import type { Order } from "@/lib/models/models"

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
      toast({ title: "Commande mise à jour", description: `Statut changé en ${newStatus}` })
    } catch (err) {
      toast({ title: "Erreur", description: "Échec de la mise à jour.", variant: "destructive" })
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-background z-40 flex items-center justify-center"><LoadingAnimation size={140} className="text-primary" /></div>
  )

  return (
    <AdminRouteGuard>
    <div className="min-h-screen bg-background p-4 w-10/12">
        <div className="container mx-auto">
          <Card className="bg-background/50 backdrop-blur-sm border-border/50 shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle className="font-serif text-xl">Commandes Récentes</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border/50">
                    <TableHead>ID Commande</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Code Promo</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.length > 0 ? orders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-primary/5 border-border/50 transition-colors">
                      <TableCell className="font-medium">#{order.id.slice(0,6)}</TableCell>
                      <TableCell>{order.customerName}</TableCell>
                      <TableCell>{order.email}</TableCell>
                      <TableCell>
                        <div>{order.total.toFixed(2)} DT</div>
                        {order.discount && order.discount > 0 && <div className="text-xs text-green-600">-{order.discount.toFixed(2)} DT</div>}
                      </TableCell>
                      <TableCell>{order.promoCode || <span className="text-muted-foreground">-</span>}</TableCell>
                      <TableCell><Badge variant="outline" className={`rounded-full px-3 py-1 ${getStatusColor(order.status)}`}>{order.status}</Badge></TableCell>
                      <TableCell>{new Date((order?.createdAt as any)?.toDate?.() ?? order?.createdAt).toLocaleString()}</TableCell>
                      <TableCell className="space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => router.push(`/admin/orders/${order.id}`)} className="hover:bg-primary/10 hover:text-primary">Voir</Button>
                        <select value={order.status} onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as Order["status"])} className="text-sm bg-transparent border border-border rounded-md px-2 py-1">
                          <option value="pending">En attente</option>
                          <option value="processing">En traitement</option>
                          <option value="shipped">Expédié</option>
                          <option value="delivered">Livré</option>
                          <option value="cancelled">Annulé</option>
                        </select>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Aucune commande trouvée</TableCell>
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
