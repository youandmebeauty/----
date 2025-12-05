import Link from "next/link"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 container mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
        <div className="max-w-md mx-auto">
          <div className="relative mb-8">
            <div className="text-9xl font-bold text-primary/10">404</div>
            <div className="absolute inset-0 flex items-center justify-center">
              <h1 className="text-4xl font-bold text-primary">Page Not Found</h1>
            </div>
          </div>

          <p className="text-lg text-muted-foreground mb-8">
            We couldn't find the page you're looking for. The page might have been moved, deleted, or never existed.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/">Return Home</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/shop">Browse Products</Link>
            </Button>
          </div>

          <div className="mt-12 pt-8 border-t">
            <p className="text-muted-foreground mb-4">Looking for something specific?</p>
            <Link href="/search" className="inline-flex items-center text-primary hover:underline">
              <Search className="h-4 w-4 mr-2" />
              Search our products
            </Link>
          </div>
        </div>
      </main>

    </div>
  )
}
