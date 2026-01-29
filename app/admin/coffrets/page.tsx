"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AdminRouteGuard } from "@/components/admin/admin-route-guard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { LoadingAnimation } from "@/components/ui/loading-animation"
import { useToast } from "@/hooks/use-toast"
import { getCoffrets } from "@/lib/services/coffret-service"
import type { Coffret } from "@/lib/models/models"

export default function AdminCoffretsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [coffrets, setCoffrets] = useState<Coffret[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const data = await getCoffrets()
      setCoffrets(data)
    } catch (err) {
      console.error(err)
      toast({ title: "Erreur", description: "Impossible de charger les coffrets.", variant: "destructive" })
    } finally { setLoading(false) }
  }

  if (loading) return (<div className="min-h-screen bg-background z-40 flex items-center justify-center"><LoadingAnimation size={140} className="text-primary"/></div>)

  return (
    <AdminRouteGuard>
      <div className="min-h-screen bg-background p-4">
        <div className="container mx-auto">
          <Card className="bg-background/50 backdrop-blur-sm border-border/50 shadow-sm overflow-hidden">
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="font-serif text-xl">Inventaire des Coffrets</CardTitle>
              <Button onClick={() => router.push('/admin/coffrets/new')} className="rounded-full">Ajouter un Coffret</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border/50">
                    <TableHead>ID</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Prix</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coffrets.length > 0 ? coffrets.map((coffret) => (
                    <TableRow key={coffret.id} className="hover:bg-primary/5 border-border/50 transition-colors">
                      <TableCell className="font-medium">#{coffret.id.slice(0,6)}</TableCell>
                      <TableCell>{coffret.name}</TableCell>
                      <TableCell>{coffret.price.toFixed(2)} DT</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => router.push(`/admin/coffrets/edit/${coffret.id}`)} className="hover:bg-primary/10 hover:text-primary">Modifier</Button>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Aucun coffret trouvé</TableCell>
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
