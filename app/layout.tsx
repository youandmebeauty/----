import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { CartProvider } from "@/components/cart-provider"
import { FirebaseProvider } from "@/components/firebase-provider"
import { LoadingProvider } from "@/components/loading-provider"
import { Toaster } from "@/components/ui/toaster"
import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
const inter = Inter({ subsets: ["latin"] })
import { Metadata } from "next"

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


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "You & Me Beauty",
    "url": "https://youandme.tn",
    "logo": "https://youandme.tn/logo.webp",
    "sameAs": [
      "https://www.facebook.com/people/YOUME-Beauty/61578933269826/",
      "https://instagram.com/youme_beauty_sfax"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+216-93-220-902",
      "contactType": "customer service",
      "areaServed": "TN",
      "availableLanguage": ["French"]
    },
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Route Lafrane KM 5.5, Markez Torki, Sfax Sud",
      "addressLocality": "Sfax",
      "addressCountry": "TN"
    }
  }

  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
      </head>
      <body className={inter.className}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <FirebaseProvider>
            <CartProvider>
              <LoadingProvider>
                <Header />
                {children}
                <Footer />
                <Toaster />
              </LoadingProvider>
            </CartProvider>
          </FirebaseProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
