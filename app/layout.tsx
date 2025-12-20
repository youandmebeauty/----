import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { CartProvider } from "@/components/cart-provider"
import { FirebaseProvider } from "@/components/firebase-provider"
import { LoadingProvider } from "@/components/loading-provider"
import { Toaster } from "@/components/ui/toaster"
import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import { SmoothScroll } from "@/components/smooth-scroll"
const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL('https://youandme.tn'),
  title: "Accueil",
  description: "Découvrez des cosmétiques et produits de beauté premium chez You & Me Beauty à Sfax. Notre analyseur de peau IA vous recommande les meilleurs produits adaptés à vos besoins. Livraison en Tunisie.",
  keywords: [
    "beauté tunisie",
    "cosmétiques sfax",
    "soins visage",
    "maquillage",
    "skincare",
    "analyseur peau IA",
    "beauty tunisia",
    "soins cheveux",
    "produits beauté premium",
    "boutique beauté sfax"
  ],
  authors: [{ name: "You & Me Beauty", url: "https://youandme.tn" }],
  creator: "You & Me Beauty",
  publisher: "You & Me Beauty",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon.png',
  },
  openGraph: {
    type: "website",
    locale: "fr_TN",
    alternateLocale: ["fr_FR", "ar_TN"],
    url: "https://youandme.tn",
    title: "Accueil - You & Me Beauty",
    description: "Découvrez l'excellence de la beauté avec You & Me Beauty à Sfax. Utilisez notre analyseur de peau IA pour des recommandations personnalisées. Livraison gratuite en Tunisie.",
    siteName: "You & Me Beauty",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "You & Me Beauty - Cosmétiques et Soins Premium en Tunisie",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "You & Me Beauty - Cosmétiques Premium",
    description: "Boutique de beauté premium à Sfax. Analyseur de peau IA, livraison en Tunisie.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add Google Search Console verification if needed
    // google: 'your-google-verification-code',
  },
  category: 'beauty',
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
      "availableLanguage": ["French", "Arabic"]
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
                <SmoothScroll />
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
