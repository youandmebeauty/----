"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { AdminRouteGuard } from "@/components/admin/admin-route-guard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LoadingAnimation } from "@/components/ui/loading-animation"
import { useToast } from "@/hooks/use-toast"
import { getCoffrets } from "@/lib/services/coffret-service"
import type { Coffret } from "@/lib/models/models"
import { Package, DollarSign, Edit, Plus, Gift, Layers } from "lucide-react"

function getCoffretImage(coffret: Coffret): string {
  if (coffret.images && coffret.images.length > 0) {
    return coffret.images[0]
  }
  return 'https://placehold.co/600x400'
 
}

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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <h1 className="font-serif text-3xl md:text-4xl font-medium tracking-tight mb-2">Coffrets</h1>
                <p className="text-muted-foreground">Gérer les coffrets cadeaux de la boutique</p>
              </div>
              <Button 
                onClick={() => router.push('/admin/coffrets/new')} 
                className="rounded-full shadow-sm hover:shadow-md transition-all"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un Coffret
              </Button>
            </div>

            {coffrets.length === 0 ? (
              <Card className="bg-background/50 backdrop-blur-sm border-border/50 shadow-sm">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Gift className="h-16 w-16 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground text-lg">Aucun coffret trouvé</p>
                  <Button 
                    onClick={() => router.push('/admin/coffrets/new')} 
                    variant="outline"
                    className="mt-4 rounded-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter votre premier coffret
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {coffrets.map((coffret) => {
                  const coffretImage = getCoffretImage(coffret)
                   
                  return (
                    <Card key={coffret.id} className="bg-background/50 backdrop-blur-sm border-border/50 shadow-sm hover:shadow-md transition-all duration-300 group overflow-hidden">
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          {/* Header with ID */}
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="text-xs text-muted-foreground mb-1">
                                #{coffret.id.slice(0, 8)}
                              </div>
                              <h3 className="font-serif text-lg font-medium leading-tight mb-2 group-hover:text-primary transition-colors">
                                {coffret.name}
                              </h3>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <Gift className="h-5 w-5 text-primary" />
                            </div>
                          </div>
                        <div className="flex gap-4 items-start justify-around w-full ">

                          {/* Coffret Image */}
                          <div className="relative aspect-[3/4] overflow-hidden  flex items-center justify-center   bg-white rounded-lg">
                              <div className="w-36 flex items-center justify-center">
                            <Image 
                              src={coffretImage} 
                              alt={coffret.name} 
                              width={144}
                                height={192}
                                className="object-cover w-full h-full"
 
                            />
                          </div>
                          </div>

                          {/* Coffret Details */}
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <DollarSign className="h-4 w-4 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-muted-foreground">Prix</p>
                                <p className="font-serif text-lg font-medium">{coffret.price.toFixed(2)} DT</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <Layers className="h-4 w-4 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-muted-foreground">Nombre de Produits</p>
                                <p className="font-serif text-lg font-medium">{coffret.productIds.length}</p>
                              </div>
      
                            </div>
                            <Button 
                            variant="outline" 
                            onClick={() => router.push(`/admin/coffrets/edit/${coffret.id}`)}
                            className="w-full rounded-full border-primary text-primary hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-all group-hover:shadow-sm"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Modifier le Coffret
                          </Button>
                          </div>
                        </div>
 

                          {/* Action Button */}
                          
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
    </AdminRouteGuard>
  )
}