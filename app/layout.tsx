import type React from "react"
import Script from "next/script"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { SmoothScrollProvider } from "@/components/providers/smooth-scroll-provider"
import { CartProvider } from "@/components/providers/cart-provider"
import { FirebaseProvider } from "@/components/providers/firebase-provider"
import { MetaAnalyticsProvider } from "@/components/providers/meta-analytics-provider"
import { Toaster } from "@/components/ui/toaster"
import { Footer } from "@/components/navigation/footer"
import { Header } from "@/components/navigation/header"


const inter = Inter({ subsets: ["latin"] })
import { FeteThemeProvider } from "@/components/providers/fete-theme-provider"

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
  // Announcement content with countdown timer or expired message
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        {/* Meta Pixel */}
        <Script
          id="meta-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${process.env.NEXT_PUBLIC_META_PIXEL_ID}');
            `,
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src={`https://www.facebook.com/tr?id=${process.env.NEXT_PUBLIC_META_PIXEL_ID}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>

        {/* Google Customer Reviews badge */}
        <Script
          id="merchantWidgetScript"
          src="https://www.gstatic.com/shopping/merchant/merchantwidget.js"
          strategy="afterInteractive"
        />
        <Script
          id="merchant-widget-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                var script = document.getElementById('merchantWidgetScript');
                if (!script) return;
                script.addEventListener('load', function () {
                  if (!window.merchantwidget) return;
                  window.merchantwidget.start({
                    merchant_id: 5722628537
                  });
                });
              })();
            `,
          }}
        />
        
      </head>
      <body className={inter.className}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ThemeProvider attribute="class" defaultTheme="light">
          <SmoothScrollProvider>
            <FirebaseProvider>
              <CartProvider>
                <MetaAnalyticsProvider />
                <FeteThemeProvider>
                    <Header />
                  {children}
                  <Footer />
                  <Toaster /></FeteThemeProvider>
              </CartProvider>
            </FirebaseProvider>
          </SmoothScrollProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
