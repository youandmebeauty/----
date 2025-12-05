import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { CartProvider } from "@/components/cart-provider"
import { FirebaseProvider } from "@/components/firebase-provider"
import { Toaster } from "@/components/ui/toaster"
import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import { SmoothScroll } from "@/components/smooth-scroll"
const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL('https://youandme.tn'),
  title: {
    default: "You & Me Beauty | Cosmétiques et Soins Premium",
    template: "%s | You & Me Beauty"
  },
  description: "Découvrez des cosmétiques et produits de beauté premium chez You & Me Beauty. Explorez notre collection de maquillage, soins de la peau et essentiels beauté pour une routine parfaite.",
  keywords: ["beauté", "cosmétiques", "soins visage", "maquillage", "skincare", "tunisie", "beauty", "soins cheveux"],
  authors: [{ name: "You & Me Beauty" }],
  creator: "You & Me Beauty",
  publisher: "You & Me Beauty",
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon.png',
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://youandme.tn",
    title: "You & Me Beauty | Cosmétiques et Soins Premium",
    description: "Découvrez l'excellence de la beauté avec You & Me Beauty. Soins, maquillage et conseils personnalisés.",
    siteName: "You & Me Beauty",
    images: [
      {
        url: "/og-image.jpg", // Ensure this image exists or is created
        width: 1200,
        height: 630,
        alt: "You & Me Beauty - Cosmétiques et Soins",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "You & Me Beauty | Cosmétiques et Soins Premium",
    description: "Découvrez des cosmétiques et produits de beauté premium chez You & Me Beauty.",
    images: ["/og-image.jpg"],
    creator: "@youmebeauty",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
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
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <FirebaseProvider>
            <CartProvider>
              <SmoothScroll />
              <Header />
              {children}
              <Footer />
              <Toaster />
            </CartProvider>
          </FirebaseProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
