"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Tag, Plus, Edit, Trash2 } from "lucide-react"
import { getPromoCodes, createPromoCode, updatePromoCode, deletePromoCode } from "@/lib/services/promo-code-service"
import type { PromoCode } from "@/lib/models/models"

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

  if (loading) return <div className="py-8 text-center text-muted-foreground">Chargement...</div>

  return (
    <div>
      <Card className="bg-background/50 backdrop-blur-sm border-border/50 shadow-sm overflow-hidden">
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="font-serif text-xl">Codes Promo</CardTitle>
          <Dialog open={promoDialogOpen} onOpenChange={(open) => { setPromoDialogOpen(open); if (!open) resetPromoForm() }}>
            <DialogTrigger asChild>
              <Button onClick={() => resetPromoForm()} className="rounded-full"><Plus className="h-4 w-4 mr-2"/>Ajouter un Code Promo</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingPromo ? "Modifier le Code Promo" : "Nouveau Code Promo"}</DialogTitle>
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
                <Button variant="outline" onClick={() => setPromoDialogOpen(false)}>Annuler</Button>
                <Button onClick={handleCreateOrUpdatePromo}>{editingPromo ? "Mettre à jour" : "Créer"}</Button>
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
              {promoCodes.length > 0 ? promoCodes.map((promo) => {
                const isExpired = promo.expiryDate ? new Date() > (typeof promo.expiryDate === "string" ? new Date(promo.expiryDate) : promo.expiryDate) : false
                const isLimitReached = promo.usageLimit && promo.usedCount ? promo.usedCount >= promo.usageLimit : false
                const isActive = promo.active && !isExpired && !isLimitReached
                return (
                  <TableRow key={promo.id} className="hover:bg-primary/5 border-border/50 transition-colors">
                    <TableCell className="font-medium"><div className="flex items-center gap-2"><Tag className="h-4 w-4 text-primary"/>{promo.code}</div></TableCell>
                    <TableCell className="capitalize">{promo.type}</TableCell>
                    <TableCell>{promo.type === "percentage" ? `${promo.value}%` : `${promo.value} DT`}</TableCell>
                    <TableCell>{promo.minPurchase ? `${promo.minPurchase} DT` : "-"}</TableCell>
                    <TableCell>{promo.usedCount || 0}{promo.usageLimit && ` / ${promo.usageLimit}`}</TableCell>
                    <TableCell>{promo.expiryDate ? new Date(typeof promo.expiryDate === "string" ? promo.expiryDate : promo.expiryDate).toLocaleDateString() : "-"}</TableCell>
                    <TableCell><Badge variant="outline" className={`rounded-full px-3 py-1 ${isActive ? "border-green-500 text-green-500 bg-green-500/5" : "border-gray-500 text-gray-500 bg-gray-500/5"}`}>{isActive ? "Actif" : "Inactif"}</Badge></TableCell>
                    <TableCell className="space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => openEditPromoDialog(promo)} className="hover:bg-primary/10 hover:text-primary"><Edit className="h-4 w-4"/></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeletePromo(promo.id)} className="hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4"/></Button>
                    </TableCell>
                  </TableRow>
                )
              }) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Aucun code promo trouvé</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

export default PromoManager
