"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Tag, Plus, Edit, Trash2, Percent, DollarSign, ShoppingCart, Users, Calendar, AlertCircle } from "lucide-react"
import { getPromoCodes, createPromoCode, updatePromoCode, deletePromoCode } from "@/lib/services/promo-code-service"
import type { PromoCode } from "@/lib/models/models"
import { LoadingAnimation } from "@/components/ui/loading-animation"

export function PromoManager() {
  const { toast } = useToast()
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([])
  const [loading, setLoading] = useState(true)
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

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const data = await getPromoCodes()
      setPromoCodes(data)
    } catch (err) {
      console.error(err)
      toast({ title: "Erreur", description: "Impossible de charger les codes promo.", variant: "destructive" })
    } finally { setLoading(false) }
  }

  const resetPromoForm = () => {
    setPromoForm({ code: "", type: "percentage", value: 0, minPurchase: "", expiryDate: "", description: "", active: true, usageLimit: "" })
    setEditingPromo(null)
  }

  const openEditPromoDialog = (promo: PromoCode) => {
    setEditingPromo(promo)
    setPromoForm({
      code: promo.code,
      type: promo.type,
      value: promo.value,
      minPurchase: promo.minPurchase?.toString() || "",
      expiryDate: promo.expiryDate ? (typeof promo.expiryDate === "string" ? promo.expiryDate.split("T")[0] : new Date(promo.expiryDate).toISOString().split("T")[0]) : "",
      description: promo.description || "",
      active: promo.active !== undefined ? promo.active : true,
      usageLimit: promo.usageLimit?.toString() || "",
    })
    setPromoDialogOpen(true)
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
        toast({ title: "Code promo mis à jour", description: "Le code promo a été mis à jour." })
      } else {
        await createPromoCode(promoData)
        toast({ title: "Code promo créé", description: "Le code promo a été créé." })
      }
      setPromoDialogOpen(false)
      resetPromoForm()
      fetchData()
    } catch (err: any) {
      toast({ title: "Erreur", description: err?.message || "Échec de l'opération.", variant: "destructive" })
    }
  }

  const handleDeletePromo = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce code promo ?")) return
    try {
      await deletePromoCode(id)
      toast({ title: "Code promo supprimé", description: "Supprimé." })
      fetchData()
    } catch (err) {
      toast({ title: "Erreur", description: "Échec de la suppression.", variant: "destructive" })
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
    <div className="min-h-screen bg-background p-4 w-full lg:w-10/12">
      <div className="relative border border-border/50 bg-gradient-to-br from-secondary/30 via-secondary/20 to-background rounded-3xl overflow-hidden min-h-[calc(100vh-2rem)]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
        
        <main className="container relative mx-auto py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="font-serif text-3xl md:text-4xl font-medium tracking-tight mb-2">Codes Promo</h1>
              <p className="text-muted-foreground">Gérer les codes promotionnels de la boutique</p>
            </div>
            <Dialog open={promoDialogOpen} onOpenChange={(open) => { setPromoDialogOpen(open); if (!open) resetPromoForm() }}>
              <DialogTrigger asChild>
                <Button onClick={() => resetPromoForm()} className="rounded-full shadow-sm hover:shadow-md transition-all">
                  <Plus className="h-4 w-4 mr-2"/>
                  Ajouter un Code Promo
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="font-serif text-xl">{editingPromo ? "Modifier le Code Promo" : "Nouveau Code Promo"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="code">Code *</Label>
                    <Input id="code" value={promoForm.code} onChange={(e) => setPromoForm({ ...promoForm, code: e.target.value.toUpperCase() })} placeholder="SAVE10" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="type">Type *</Label>
                      <Select value={promoForm.type} onValueChange={(v) => setPromoForm({ ...promoForm, type: v as any })}>
                        <SelectTrigger><SelectValue/></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">Pourcentage</SelectItem>
                          <SelectItem value="fixed">Montant Fixe</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="value">Valeur *</Label>
                      <Input id="value" type="number" value={promoForm.value} onChange={(e) => setPromoForm({ ...promoForm, value: Number(e.target.value) })} placeholder={promoForm.type === "percentage" ? "10" : "50"} min="0" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="minPurchase">Achat Minimum (DT)</Label>
                      <Input id="minPurchase" type="number" value={promoForm.minPurchase} onChange={(e) => setPromoForm({ ...promoForm, minPurchase: e.target.value })} placeholder="100" min="0" />
                    </div>
                    <div>
                      <Label htmlFor="usageLimit">Limite d'Utilisation</Label>
                      <Input id="usageLimit" type="number" value={promoForm.usageLimit} onChange={(e) => setPromoForm({ ...promoForm, usageLimit: e.target.value })} placeholder="100" min="0" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="expiryDate">Date d'Expiration</Label>
                    <Input id="expiryDate" type="date" value={promoForm.expiryDate} onChange={(e) => setPromoForm({ ...promoForm, expiryDate: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" value={promoForm.description} onChange={(e) => setPromoForm({ ...promoForm, description: e.target.value })} rows={3} />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="active" checked={promoForm.active} onCheckedChange={(checked) => setPromoForm({ ...promoForm, active: checked as boolean })} />
                    <Label htmlFor="active">Actif</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setPromoDialogOpen(false)} className="rounded-full">Annuler</Button>
                  <Button onClick={handleCreateOrUpdatePromo} className="rounded-full">{editingPromo ? "Mettre à jour" : "Créer"}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {promoCodes.length === 0 ? (
            <Card className="bg-background/50 backdrop-blur-sm border-border/50 shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Tag className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground text-lg">Aucun code promo trouvé</p>
                <Button 
                  onClick={() => { resetPromoForm(); setPromoDialogOpen(true) }} 
                  variant="outline"
                  className="mt-4 rounded-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter votre premier code promo
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {promoCodes.map((promo) => {
                const isExpired = promo.expiryDate ? new Date() > (typeof promo.expiryDate === "string" ? new Date(promo.expiryDate) : promo.expiryDate) : false
                const isLimitReached = promo.usageLimit && promo.usedCount ? promo.usedCount >= promo.usageLimit : false
                const isActive = promo.active && !isExpired && !isLimitReached
                
                return (
                  <Card key={promo.id} className="bg-background/50 backdrop-blur-sm border-border/50 shadow-sm hover:shadow-md transition-all duration-300 group overflow-hidden">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {/* Header with Code and Status */}
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Tag className="h-5 w-5 text-primary" />
                              <h3 className="font-serif text-xl font-bold tracking-wide group-hover:text-primary transition-colors">
                                {promo.code}
                              </h3>
                            </div>
                            {promo.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {promo.description}
                              </p>
                            )}
                          </div>
                          <Badge variant="outline" className={`rounded-full px-3 py-1 text-xs ${isActive ? "border-green-500 text-green-500 bg-green-500/5" : "border-gray-500 text-gray-500 bg-gray-500/5"}`}>
                            {isActive ? "Actif" : "Inactif"}
                          </Badge>
                        </div>

                        {/* Discount Value - Highlighted */}
                        <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4 border border-primary/20">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                              {promo.type === "percentage" ? (
                                <Percent className="h-6 w-6 text-primary" />
                              ) : (
                                <DollarSign className="h-6 w-6 text-primary" />
                              )}
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Réduction</p>
                              <p className="font-serif text-2xl font-bold text-primary">
                                {promo.type === "percentage" ? `${promo.value}%` : `${promo.value} DT`}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Details Grid */}
                        <div className="space-y-3">
                          {promo.minPurchase && (
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <ShoppingCart className="h-4 w-4 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-muted-foreground">Achat minimum</p>
                                <p className="font-medium">{promo.minPurchase} DT</p>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <Users className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-muted-foreground">Utilisations</p>
                              <p className="font-medium">
                                {promo.usedCount || 0}
                                {promo.usageLimit && ` / ${promo.usageLimit}`}
                                {!promo.usageLimit && " (illimité)"}
                              </p>
                            </div>
                          </div>

                          {promo.expiryDate && (
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <Calendar className="h-4 w-4 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-muted-foreground">Date d'expiration</p>
                                <p className="font-medium">
                                  {new Date(typeof promo.expiryDate === "string" ? promo.expiryDate : promo.expiryDate).toLocaleDateString('fr-FR')}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Warning Messages */}
                        {isExpired && (
                          <div className="flex items-start gap-2 p-3 bg-orange-500/5 border border-orange-500/20 rounded-lg">
                            <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-orange-600">Ce code promo a expiré</p>
                          </div>
                        )}

                        {isLimitReached && !isExpired && (
                          <div className="flex items-start gap-2 p-3 bg-orange-500/5 border border-orange-500/20 rounded-lg">
                            <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-orange-600">Limite d'utilisation atteinte</p>
                          </div>
                        )}

                        {!promo.active && !isExpired && !isLimitReached && (
                          <div className="flex items-start gap-2 p-3 bg-gray-500/5 border border-gray-500/20 rounded-lg">
                            <AlertCircle className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-gray-600">Ce code promo est désactivé</p>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-2">
                          <Button 
                            variant="outline" 
                            onClick={() => openEditPromoDialog(promo)}
                            className="flex-1 rounded-full border-border/50 hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-all"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Modifier
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => handleDeletePromo(promo.id)}
                            className="rounded-full border-border/50 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-all"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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
  )
}

export default PromoManager