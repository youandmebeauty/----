"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AdminRouteGuard } from "@/components/admin-route-guard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { Package, ShoppingCart, Users, DollarSign, LogOut, TrendingUp, BarChart3 } from "lucide-react"
import { getProducts } from "@/lib/services/product-service"
import { getOrders, updateOrderStatus } from "@/lib/services/order-service"
import { getAnalytics } from "@/lib/services/analytics-service"
import { getPromoCodes, createPromoCode, updatePromoCode, deletePromoCode } from "@/lib/services/promo-code-service"
import type { Product, Order, PromoCode } from "@/lib/models"
import type { AnalyticsPeriod } from "@/lib/services/analytics-service"
import { MetricsCard } from "@/components/admin/metrics-card"
import { AnalyticsChart } from "@/components/admin/analytics-chart"
import { LoadingAnimation } from "@/components/ui/loading-animation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tag, Plus, Edit, Trash2 } from "lucide-react"

function DashboardContent() {
  const router = useRouter()
  const { toast } = useToast()
  const { signOut } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([])
  const [analytics, setAnalytics] = useState<AnalyticsPeriod | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
  })
  const [promoDialogOpen, setPromoDialogOpen] = useState(false)
  const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null)
  const [promoForm, setPromoForm] = useState({
    code: "",
    type: "percentage" as "percentage" | "fixed",
    value: 0,
    minPurchase: "",
    expiryDate: "",
    description: "",
    active: true,
    usageLimit: "",
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)

      // Fetch products, orders, promo codes, and analytics from Firebase
      const [productsData, ordersData, promoCodesData, analyticsData] = await Promise.all([
        getProducts(),
        getOrders(),
        getPromoCodes(),
        getAnalytics(),
      ])

      setProducts(productsData)
      setOrders(ordersData)
      setPromoCodes(promoCodesData)
      setAnalytics(analyticsData)

      // Calculate stats - only count revenue from shipped and delivered orders
      const fulfilledOrders = ordersData.filter(
        (order) => order.status === "shipped" || order.status === "delivered"
      )

      setStats({
        totalProducts: productsData.length,
        totalOrders: ordersData.length,
        totalRevenue: fulfilledOrders.reduce((sum, order) => sum + order.total, 0),
        pendingOrders: ordersData.filter((order) => order.status === "pending").length,
      })
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Erreur",
        description: "Échec du chargement des données du tableau de bord.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order["status"]) => {
    try {
      await updateOrderStatus(orderId, newStatus)

      // Update local state
      setOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)))

      // Recalculate stats after status update
      const updatedOrders = orders.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order))
      
      const fulfilledOrders = updatedOrders.filter(
        (order) => order.status === "shipped" || order.status === "delivered"
      )

      setStats((prev) => ({
        ...prev,
        totalRevenue: fulfilledOrders.reduce((sum, order) => sum + order.total, 0),
        pendingOrders: updatedOrders.filter((order) => order.status === "pending").length,
      }))

      toast({
        title: "Commande mise à jour",
        description: `Statut de la commande changé en ${newStatus}.`,
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Échec de la mise à jour du statut de la commande.",
        variant: "destructive",
      })
    }
  }

  const handleCreateOrUpdatePromo = async () => {
    try {
      const promoData = {
        code: promoForm.code,
        type: promoForm.type,
        value: promoForm.value,
        minPurchase: promoForm.minPurchase ? Number(promoForm.minPurchase) : undefined,
        expiryDate: promoForm.expiryDate ? new Date(promoForm.expiryDate) : undefined,
        description: promoForm.description || undefined,
        active: promoForm.active,
        usageLimit: promoForm.usageLimit ? Number(promoForm.usageLimit) : undefined,
      }

      if (editingPromo) {
        await updatePromoCode(editingPromo.id, promoData)
        toast({
          title: "Code promo mis à jour",
          description: "Le code promo a été mis à jour avec succès.",
        })
      } else {
        await createPromoCode(promoData)
        toast({
          title: "Code promo créé",
          description: "Le code promo a été créé avec succès.",
        })
      }

      setPromoDialogOpen(false)
      resetPromoForm()
      fetchData()
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Échec de l'opération.",
        variant: "destructive",
      })
    }
  }

  const handleDeletePromo = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce code promo ?")) {
      return
    }

    try {
      await deletePromoCode(id)
      toast({
        title: "Code promo supprimé",
        description: "Le code promo a été supprimé avec succès.",
      })
      fetchData()
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Échec de la suppression du code promo.",
        variant: "destructive",
      })
    }
  }

  const resetPromoForm = () => {
    setPromoForm({
      code: "",
      type: "percentage",
      value: 0,
      minPurchase: "",
      expiryDate: "",
      description: "",
      active: true,
      usageLimit: "",
    })
    setEditingPromo(null)
  }

  const openEditPromoDialog = (promo: PromoCode) => {
    setEditingPromo(promo)
    setPromoForm({
      code: promo.code,
      type: promo.type,
      value: promo.value,
      minPurchase: promo.minPurchase?.toString() || "",
      expiryDate: promo.expiryDate
        ? (typeof promo.expiryDate === "string"
            ? promo.expiryDate.split("T")[0]
            : new Date(promo.expiryDate).toISOString().split("T")[0])
        : "",
      description: promo.description || "",
      active: promo.active !== undefined ? promo.active : true,
      usageLimit: promo.usageLimit?.toString() || "",
    })
    setPromoDialogOpen(true)
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingAnimation size={140} className="text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="relative border border-border/50 bg-gradient-to-br from-secondary/30 via-secondary/20 to-background rounded-3xl overflow-hidden min-h-[calc(100vh-2rem)]">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

        <main className="container relative mx-auto px-6 py-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h1 className="font-serif text-3xl md:text-4xl font-medium tracking-tight mb-2">Tableau de bord</h1>
              <p className="text-muted-foreground">Vue d'ensemble de votre boutique</p>
            </div>
            <Button onClick={signOut} variant="outline" className="rounded-full border-border/50 hover:bg-destructive/5 hover:text-destructive hover:border-destructive/20 transition-colors">
              <LogOut className="h-4 w-4 mr-2" />
              Déconnexion
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <Card className="bg-background/50 backdrop-blur-sm border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Produits</CardTitle>
                <Package className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-serif font-medium">{stats.totalProducts}</div>
              </CardContent>
            </Card>

            <Card className="bg-background/50 backdrop-blur-sm border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Commandes</CardTitle>
                <ShoppingCart className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-serif font-medium">{stats.totalOrders}</div>
              </CardContent>
            </Card>

            <Card className="bg-background/50 backdrop-blur-sm border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Revenu Total</CardTitle>
                <DollarSign className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-serif font-medium">{stats.totalRevenue.toFixed(2)} DT</div>
                <p className="text-xs text-muted-foreground mt-1">Expédiées & Livrées uniquement</p>
              </CardContent>
            </Card>

            <Card className="bg-background/50 backdrop-blur-sm border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Commandes en Attente
                </CardTitle>
                <Users className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-serif font-medium">{stats.pendingOrders}</div>
              </CardContent>
            </Card>
          </div>

          {/* Analytics Section */}
          {analytics && (
            <div className="space-y-6 mb-12">
              <h2 className="font-serif text-2xl font-medium">Analytiques</h2>

              {/* Period Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricsCard
                  title="Aujourd'hui"
                  value={`${analytics.today.totalRevenue.toFixed(2)} DT`}
                  icon={<DollarSign className="h-4 w-4" />}
                  format="currency"
                />
                <MetricsCard
                  title="Cette Semaine"
                  value={`${analytics.week.totalRevenue.toFixed(2)} DT`}
                  icon={<TrendingUp className="h-4 w-4" />}
                  format="currency"
                />
                <MetricsCard
                  title="Ce Mois"
                  value={`${analytics.month.totalRevenue.toFixed(2)} DT`}
                  icon={<BarChart3 className="h-4 w-4" />}
                  format="currency"
                />
              </div>

              {/* Sales Chart */}
              <AnalyticsChart data={analytics.salesChart} title="Ventes des 7 derniers jours" />

              {/* Top Products */}
              {analytics.topProducts.length > 0 && (
                <Card className="bg-background/50 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle className="font-serif text-xl">Top 5 Produits</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analytics.topProducts.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium">{item.product.name}</p>
                              <p className="text-sm text-muted-foreground">{item.totalSold} vendus</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{item.revenue.toFixed(2)} DT</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Tabs */}
          <Tabs defaultValue="orders" className="space-y-8">
            <TabsList className="bg-background/50 backdrop-blur-sm border border-border/50 p-1 rounded-full">
              <TabsTrigger value="orders" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Commandes</TabsTrigger>
              <TabsTrigger value="products" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Produits</TabsTrigger>
              <TabsTrigger value="promos" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Codes Promo</TabsTrigger>
            </TabsList>

            <TabsContent value="orders">
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
                      {orders.length > 0 ? (
                        orders.map((order) => (
                          <TableRow key={order.id} className="hover:bg-primary/5 border-border/50 transition-colors">
                            <TableCell className="font-medium">#{order.id.slice(0, 6)}</TableCell>
                            <TableCell>{order.customerName}</TableCell>
                            <TableCell>{order.email}</TableCell>
                            <TableCell>
                              <div>
                                <div>{order.total.toFixed(2)} DT</div>
                                {order.discount && order.discount > 0 && (
                                  <div className="text-xs text-green-600">
                                    -{order.discount.toFixed(2)} DT
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {order.promoCode ? (
                                <Badge variant="secondary" className="rounded-full">
                                  <Tag className="h-3 w-3 mr-1" />
                                  {order.promoCode}
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground text-sm">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={`rounded-full px-3 py-1 ${getStatusColor(order.status)}`}>
                                {order.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(
                                (order?.createdAt as any)?.toDate?.() ?? order?.createdAt
                              ).toLocaleString()}
                            </TableCell>
                            <TableCell className="space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push(`/admin/orders/${order.id}`)}
                                className="hover:bg-primary/10 hover:text-primary"
                              >
                                Voir
                              </Button>
                              <select
                                value={order.status}
                                onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as Order["status"])}
                                className="text-sm bg-transparent border border-border rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
                                disabled={order.status === "cancelled"}
                              >
                                <option value="pending">En attente</option>
                                <option value="processing">En traitement</option>
                                <option value="shipped">Expédié</option>
                                <option value="delivered">Livré</option>
                                <option value="cancelled">Annulé</option>
                              </select>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                            Aucune commande trouvée
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="products">
              <Card className="bg-background/50 backdrop-blur-sm border-border/50 shadow-sm overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="font-serif text-xl">Inventaire des Produits</CardTitle>
                  <Button onClick={() => router.push("/admin/products/new")} className="rounded-full">Ajouter un Produit</Button>
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
                      {products.length > 0 ? (
                        products.map((product) => (
                          <TableRow key={product.id} className="hover:bg-primary/5 border-border/50 transition-colors">
                            <TableCell className="font-medium">#{product.id.slice(0, 6)}</TableCell>
                            <TableCell>{product.name}</TableCell>
                            <TableCell className="capitalize">
                              <Badge variant="secondary" className="rounded-full font-normal">
                                {product.category}
                              </Badge>
                            </TableCell>
                            <TableCell>{product.price.toFixed(2)} DT</TableCell>
                            <TableCell>{product.quantity}</TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={`rounded-full px-3 py-1 ${product.quantity > 10
                                  ? "border-green-500 text-green-500 bg-green-500/5"
                                  : product.quantity > 0
                                    ? "border-orange-500 text-orange-500 bg-orange-500/5"
                                    : "border-destructive text-destructive bg-destructive/5"
                                  }`}
                              >
                                {product.quantity > 10 ? "En stock" : product.quantity > 0 ? "Stock faible" : "Rupture de stock"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push(`/admin/products/edit/${product.id}`)}
                                className="hover:bg-primary/10 hover:text-primary"
                              >
                                Modifier
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            Aucun produit trouvé
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="promos">
              <Card className="bg-background/50 backdrop-blur-sm border-border/50 shadow-sm overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="font-serif text-xl">Codes Promo</CardTitle>
                  <Dialog open={promoDialogOpen} onOpenChange={(open) => {
                    setPromoDialogOpen(open)
                    if (!open) resetPromoForm()
                  }}>
                    <DialogTrigger asChild>
                      <Button onClick={() => resetPromoForm()} className="rounded-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Ajouter un Code Promo
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{editingPromo ? "Modifier le Code Promo" : "Nouveau Code Promo"}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="code">Code *</Label>
                          <Input
                            id="code"
                            value={promoForm.code}
                            onChange={(e) => setPromoForm({ ...promoForm, code: e.target.value.toUpperCase() })}
                            placeholder="SAVE10"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="type">Type *</Label>
                            <Select
                              value={promoForm.type}
                              onValueChange={(value) => setPromoForm({ ...promoForm, type: value as "percentage" | "fixed" })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="percentage">Pourcentage</SelectItem>
                                <SelectItem value="fixed">Montant Fixe</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="value">Valeur *</Label>
                            <Input
                              id="value"
                              type="number"
                              value={promoForm.value}
                              onChange={(e) => setPromoForm({ ...promoForm, value: Number(e.target.value) })}
                              placeholder={promoForm.type === "percentage" ? "10" : "50"}
                              required
                              min="0"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              {promoForm.type === "percentage" ? "Pourcentage de réduction" : "Montant en DT"}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="minPurchase">Achat Minimum (DT)</Label>
                            <Input
                              id="minPurchase"
                              type="number"
                              value={promoForm.minPurchase}
                              onChange={(e) => setPromoForm({ ...promoForm, minPurchase: e.target.value })}
                              placeholder="100"
                              min="0"
                            />
                          </div>
                          <div>
                            <Label htmlFor="usageLimit">Limite d'Utilisation</Label>
                            <Input
                              id="usageLimit"
                              type="number"
                              value={promoForm.usageLimit}
                              onChange={(e) => setPromoForm({ ...promoForm, usageLimit: e.target.value })}
                              placeholder="100"
                              min="0"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="expiryDate">Date d'Expiration</Label>
                          <Input
                            id="expiryDate"
                            type="date"
                            value={promoForm.expiryDate}
                            onChange={(e) => setPromoForm({ ...promoForm, expiryDate: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={promoForm.description}
                            onChange={(e) => setPromoForm({ ...promoForm, description: e.target.value })}
                            placeholder="Description du code promo..."
                            rows={3}
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="active"
                            checked={promoForm.active}
                            onCheckedChange={(checked) => setPromoForm({ ...promoForm, active: checked })}
                          />
                          <Label htmlFor="active">Actif</Label>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setPromoDialogOpen(false)}>
                          Annuler
                        </Button>
                        <Button onClick={handleCreateOrUpdatePromo}>
                          {editingPromo ? "Mettre à jour" : "Créer"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent border-border/50">
                        <TableHead>Code</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Valeur</TableHead>
                        <TableHead>Achat Min.</TableHead>
                        <TableHead>Utilisations</TableHead>
                        <TableHead>Expiration</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {promoCodes.length > 0 ? (
                        promoCodes.map((promo) => {
                          const isExpired = promo.expiryDate
                            ? new Date() > (typeof promo.expiryDate === "string" ? new Date(promo.expiryDate) : promo.expiryDate)
                            : false
                          const isLimitReached = promo.usageLimit && promo.usedCount
                            ? promo.usedCount >= promo.usageLimit
                            : false
                          const isActive = promo.active && !isExpired && !isLimitReached

                          return (
                            <TableRow key={promo.id} className="hover:bg-primary/5 border-border/50 transition-colors">
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  <Tag className="h-4 w-4 text-primary" />
                                  {promo.code}
                                </div>
                              </TableCell>
                              <TableCell className="capitalize">{promo.type}</TableCell>
                              <TableCell>
                                {promo.type === "percentage" ? `${promo.value}%` : `${promo.value} DT`}
                              </TableCell>
                              <TableCell>{promo.minPurchase ? `${promo.minPurchase} DT` : "-"}</TableCell>
                              <TableCell>
                                {promo.usedCount || 0}
                                {promo.usageLimit && ` / ${promo.usageLimit}`}
                              </TableCell>
                              <TableCell>
                                {promo.expiryDate
                                  ? new Date(
                                      typeof promo.expiryDate === "string" ? promo.expiryDate : promo.expiryDate
                                    ).toLocaleDateString()
                                  : "-"}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={`rounded-full px-3 py-1 ${
                                    isActive
                                      ? "border-green-500 text-green-500 bg-green-500/5"
                                      : "border-gray-500 text-gray-500 bg-gray-500/5"
                                  }`}
                                >
                                  {isActive ? "Actif" : "Inactif"}
                                </Badge>
                              </TableCell>
                              <TableCell className="space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditPromoDialog(promo)}
                                  className="hover:bg-primary/10 hover:text-primary"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeletePromo(promo.id)}
                                  className="hover:bg-destructive/10 hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          )
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                            Aucun code promo trouvé
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  return (
    <AdminRouteGuard>
      <DashboardContent />
    </AdminRouteGuard>
  )
}