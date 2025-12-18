import { Hero } from "@/components/hero"
import { FeaturedProductsServer } from "@/components/featured-products-server"
import { CategoriesServer } from "@/components/categories-server"
import { WhyChooseUsServer } from "@/components/why-choose-us-server"
import { MakeupModel3D } from "@/components/makeup-model"
import { ClientScrollAnimation } from "@/components/client-scroll-animation"

import { Metadata } from "next"

export const metadata: Metadata = {
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
        <ClientScrollAnimation variant="fadeIn" duration={0.8}>
          <Hero />
        </ClientScrollAnimation>
        <div className="hidden lg:block absolute -top-5 right-0 w-1/2 h-[100vh] z-20" >
          <MakeupModel3D />
        </div>
        <ClientScrollAnimation variant="slideUp" delay={0.2}>
          <CategoriesServer />
        </ClientScrollAnimation>
        <ClientScrollAnimation variant="slideUp" delay={0.3}>
          <FeaturedProductsServer />
        </ClientScrollAnimation>
        <ClientScrollAnimation variant="slideUp" delay={0.4}>
          <WhyChooseUsServer />
        </ClientScrollAnimation>
      </main>
    </div>
  )
}
