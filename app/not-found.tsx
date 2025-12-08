import Link from "next/link"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

export default function NotFound() {
  return (
    <div className=" bg-background flex flex-col">
      <main className="flex-1 container mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
        <div className="max-w-md mx-auto">
          <div className="relative mb-8">
            <div className="text-9xl font-bold text-primary/10">404</div>
            <div className="absolute inset-0 flex items-center justify-center">
              <h1 className="text-4xl font-bold text-primary">Page introuvable</h1>
            </div>
          </div>

          <p className="text-lg text-muted-foreground mb-8">
            Nous n'avons pas pu trouver la page que vous recherchez. La page a peut-être été déplacée, supprimée ou n'a jamais existé.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/">Retour à l'accueil</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/shop">Parcourir les produits</Link>
            </Button>
          </div>


        </div>
      </main>

    </div>
  )
}
