import { Hero } from "@/components/hero"
import { FeaturedProductsServer } from "@/components/featured-products-server"
import { CategoriesServer } from "@/components/categories-server"
import { WhyChooseUsServer } from "@/components/why-choose-us-server"
import { MakeupModel3D } from "@/components/makeup-model"
import { ClientScrollAnimation } from "@/components/client-scroll-animation"
import Link from "next/link"

import { Metadata } from "next"

export const metadata: Metadata = {
  title: "You & Me Beauty - Produits de Beauté Premium & Soins du Visage",
  alternates: {
    canonical: "https://youandme.tn",
  },
  description: "Bienvenue chez You & Me Beauty. Découvrez notre gamme exclusive de produits de beauté, soins du visage et maquillage pour sublimer votre beauté naturelle.",
}

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "You & Me Beauty",
    "url": "https://youandme.tn",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://youandme.tn/shop?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  }

  return (
    <div className="min-h-screen overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main>
        <section aria-label="Hero section">
          <ClientScrollAnimation variant="fadeIn" duration={0.8}>
            <Hero />
          </ClientScrollAnimation>
        </section>
        
        <div className="hidden lg:block absolute -top-5 right-0 w-1/2 h-[100vh] z-20" >
          <MakeupModel3D />
        </div>
        
        <section aria-label="Product categories">
          <ClientScrollAnimation variant="slideUp" delay={0.2}>
            <CategoriesServer />
          </ClientScrollAnimation>
        </section>
        
        <section aria-label="Featured products">
          <ClientScrollAnimation variant="slideUp" delay={0.3}>
            <FeaturedProductsServer />
          </ClientScrollAnimation>
        </section>
        
        <section aria-label="Why choose us">
          <ClientScrollAnimation variant="slideUp" delay={0.4}>
            <WhyChooseUsServer />
          </ClientScrollAnimation>
        </section>

        <section aria-label="Quick links" className="mt-20 mb-12 m-4">
          <div className="container mx-auto px-4">
            <h2 className="sr-only">Liens rapides</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link 
                href="/shop" 
                className="p-6 rounded-xl bg-secondary/50 hover:bg-secondary/70 transition-colors"
              >
                <h3 className="font-semibold mb-2">Boutique</h3>
                <p className="text-sm text-muted-foreground">Parcourez tous nos produits de beauté premium</p>
              </Link>
              <Link 
                href="/skin-analyzer" 
                className="p-6 rounded-xl bg-secondary/50 hover:bg-secondary/70 transition-colors"
              >
                <h3 className="font-semibold mb-2">Diagnostic IA</h3>
                <p className="text-sm text-muted-foreground">Analysez votre type de peau avec notre IA</p>
              </Link>
              <Link 
                href="/contact" 
                className="p-6 rounded-xl bg-secondary/50 hover:bg-secondary/70 transition-colors"
              >
                <h3 className="font-semibold mb-2">Nous Contacter</h3>
                <p className="text-sm text-muted-foreground">Posez vos questions à notre équipe</p>
              </Link>
              <Link 
                href="/cart" 
                className="p-6 rounded-xl bg-secondary/50 hover:bg-secondary/70 transition-colors"
              >
                <h3 className="font-semibold mb-2">Panier</h3>
                <p className="text-sm text-muted-foreground">Consultez et gérez vos articles</p>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
