import { Hero } from "@/components/hero"
import { FeaturedProductsServer } from "@/components/featured-products-server"
import { Categories } from "@/components/categories"
import { WhyChooseUs } from "@/components/why-choose-us"
import { ClientScrollAnimation } from "@/components/client-scroll-animation"
import { MakeupModelWrapper } from "@/components/makeup-model-wrapper"

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
        
        <div className="hidden lg:block absolute -top-5 right-0 h-[92vh] w-1/2 z-20" >
          <MakeupModelWrapper />
        </div>
        
        <section aria-label="Product categories">
          <ClientScrollAnimation variant="slideUp" delay={0.2}>
            <Categories />
          </ClientScrollAnimation>
        </section>
        
        <section aria-label="Featured products">
          <ClientScrollAnimation variant="slideUp" delay={0.3}>
            <FeaturedProductsServer />
          </ClientScrollAnimation>
        </section>
        
        <section aria-label="Why choose us">
            <WhyChooseUs />
        </section>
      </main>
    </div>
  )
}
