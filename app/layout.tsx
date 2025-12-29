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
