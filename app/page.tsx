import { Hero } from "@/components/hero"
import { FeaturedProductsServer } from "@/components/featured-products-server"
import { CategoriesServer } from "@/components/categories-server"
import { WhyChooseUsServer } from "@/components/why-choose-us-server"
import { MakeupModel3D } from "@/components/makeup-model"
import { ClientScrollAnimation } from "@/components/client-scroll-animation"


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
        
        <div className="absolute -top-5 md:right-0 -right-40 w-full h-[150vh] md:h-[92vh] md:w-1/2 z-20 overflow-hidden" >
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
            <WhyChooseUsServer />
        </section>
      </main>
    </div>
  )
}
