import { Hero } from "@/components/hero"
import { FeaturedProducts } from "@/components/featured-products"
import { Categories } from "@/components/categories"
import { WhyChooseUs } from "@/components/why-choose-us"
import { MakeupModel3D } from "@/components/makeup-model"
import { ScrollAnimation } from "@/components/scroll-animation"

import { Metadata } from "next"

export const metadata: Metadata = {
  // Keep this short; layout template appends "| You & Me Beauty" automatically
  title: "Accueil",
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
        "urlTemplate": "https://youandme.tn/shop?search={search_term_string}"
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
        <ScrollAnimation variant="fadeIn" duration={0.8}>
          <Hero />
        </ScrollAnimation>
        <div className="hidden lg:block absolute -top-5 right-0 w-1/2 h-[100vh] z-20" >
          <MakeupModel3D />
        </div>
        <ScrollAnimation variant="slideUp" delay={0.2}>
          <Categories />
        </ScrollAnimation>
        <ScrollAnimation variant="slideUp" delay={0.3}>
          <FeaturedProducts />
        </ScrollAnimation>
        <ScrollAnimation variant="slideUp" delay={0.4}>
          <WhyChooseUs />
        </ScrollAnimation>
      </main>
    </div>
  )
}
