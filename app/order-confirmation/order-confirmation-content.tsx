"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { CheckCircle, Download } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { generateInvoicePDF, type InvoiceDetails } from "@/lib/generate-invoice-pdf"

const STORAGE_KEY = "lastOrderInvoice"

export default function OrderConfirmationContent() {
  const { toast } = useToast()
  const [invoiceData, setInvoiceData] = useState<InvoiceDetails | null>(null)
  const [invoiceBlob, setInvoiceBlob] = useState<Blob | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    try {
      const cached = localStorage.getItem(STORAGE_KEY)
      if (cached) {
        setInvoiceData(JSON.parse(cached) as InvoiceDetails)
      }
    } catch (error) {
      console.error("Unable to load cached invoice payload:", error)
    }
  }, [])

  const handleDownloadInvoice = () => {
    if (!invoiceData || !invoiceData.orderId) {
      toast({
        title: "Aucune commande trouvée",
        description: "Nous n'avons pas pu récupérer les détails de la dernière commande.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsGenerating(true)

      const blob = invoiceBlob || generateInvoicePDF(invoiceData)
      if (!invoiceBlob) {
        setInvoiceBlob(blob)
      }

      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `YouMeBeauty_facture_${invoiceData.orderId}.pdf`
      link.click()
      URL.revokeObjectURL(url)

      toast({
        title: "Facture téléchargée",
        description: "Votre facture a été générée avec succès.",
      })
    } catch (error) {
      console.error("Invoice download error:", error)
      toast({
        title: "Échec du téléchargement",
        description: "Impossible de générer la facture pour le moment.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <Card>
            <CardHeader>
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <CardTitle className="text-2xl">Commande confirmée</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2 text-muted-foreground">
                <p>Merci pour votre achat ! Nous traitons votre commande et vous enverrons un e-mail de confirmation.</p>
                <p>Vous pouvez télécharger votre facture dès maintenant ou continuer vos achats.</p>
              </div>

              <div className="rounded-lg bg-muted/60 p-4 text-left text-sm">
                {invoiceData ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Référence</span>
                      <span className="font-semibold">{invoiceData.orderId}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Montant total</span>
                      <span className="font-semibold">{invoiceData.total.toFixed(2)} DT</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Paiement</span>
                      <span className="font-semibold">{invoiceData.paymentMethod}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    Les détails de votre commande ne sont pas disponibles. Si vous venez de passer commande, réessayez dans
                    un instant.
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild>
                  <Link href="/shop">Continuer les achats</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/">Retour à l'accueil</Link>
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleDownloadInvoice}
                  disabled={!invoiceData || isGenerating}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  {isGenerating ? "Génération..." : "Télécharger la facture"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
