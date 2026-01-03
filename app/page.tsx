import { Hero } from "@/components/hero"
import { FeaturedProductsServer } from "@/components/featured-products-server"
import { Categories } from "@/components/categories"
import { WhyChooseUs } from "@/components/why-choose-us"
import { MakeupModelWrapper } from "@/components/makeup-model-wrapper"
import { Metadata } from "next"

import { ScrollAnimation } from "@/components/scroll-animation"
export const metadata: Metadata = {
  title: "You & Me Beauty - Parapharmacie et Cosmétique Sfax | Maquillage & Parfums en Ligne Tunisie",
  alternates: {
    canonical: "https://youandme.tn",
  },
  description: "Découvrez You & Me Beauty, votre parapharmacie et cosmétique à Sfax avec vente en ligne. Large sélection de maquillage professionnel, parfums originaux et produits de beauté authentiques. Livraison rapide dans toute la Tunisie.",
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: "You & Me Beauty - Parapharmacie et Cosmétique Sfax | Maquillage & Parfums en Ligne Tunisie",
    description: "Découvrez You & Me Beauty, votre parapharmacie et cosmétique à Sfax avec vente en ligne. Large sélection de maquillage professionnel, parfums originaux et produits de beauté authentiques. Livraison rapide dans toute la Tunisie.",
    url: "https://youandme.tn",
    siteName: "You & Me Beauty",
    locale: "fr_TN",
    type: "website",
    images: [
      {
        url: 'https://youandme.tn/og-image.png',
        width: 1200,
        height: 630,
        alt: 'You & Me Beauty',
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "You & Me Beauty - Parapharmacie et Cosmétique Sfax | Maquillage & Parfums en Ligne Tunisie",
    description: "Découvrez You & Me Beauty, votre parapharmacie et cosmétique à Sfax avec vente en ligne. Large sélection de maquillage professionnel, parfums originaux et produits de beauté authentiques. Livraison rapide dans toute la Tunisie.",
    images: ["https://youandme.tn/og-image.png"],
  },
  keywords: [
    "parapharmacie Sfax",
    "cosmétique Sfax",
    "parapharmacie en ligne Tunisie",
    "maquillage Tunisie",
    "parfums originaux Tunisie",
    "produits de beauté Sfax",
    "maquillage professionnel",
    "soins du visage",
    "parfumerie Sfax",
    "You & Me Beauty"
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
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
          <ScrollAnimation
            variant="slideUp"
            duration={1}
            perspective={1600}
            start="top 85%"
            end="bottom center"
          >
            <Hero />
          </ScrollAnimation>
        </section>
        
        <ScrollAnimation
            variant="blurRise"
            duration={2.5} className="hidden lg:block absolute mt-5 top-0 right-0 h-[92vh] w-1/2 z-20" >
          <MakeupModelWrapper />
        </ScrollAnimation>
        
        <section aria-label="Product categories">
          <ScrollAnimation
            variant="liquidRise"
            duration={1.2}
            start="top 80%"
            end="bottom center"
          >
            <Categories />
          </ScrollAnimation>
        </section>
        
        <section aria-label="Featured products">
          <ScrollAnimation
            variant="slideUp"
            duration={0.9}
          
            delay={0.15}
          >
            <FeaturedProductsServer />
          </ScrollAnimation>
        </section>
        
        <section aria-label="Why choose us">
            <WhyChooseUs />
        </section>
      </main>
    </div>
  )
}
