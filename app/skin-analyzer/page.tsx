import { Metadata } from "next";
import dynamic from "next/dynamic";
import { LoadingAnimation } from "@/components/ui/loading-animation";
// Remove Loader2 import or keep if used elsewhere (it's not used elsewhere in this file)
export async function generateMetadata({ 
}: {}): Promise<Metadata> {
    const canonicalUrl = `https://youandme.tn/skin-analyzer`;

  return {
    title: "Analyseur de Peau - You & Me Beauty",
    description: "Découvrez votre type de peau et recevez des recommandations de produits personnalisées avec notre analyseur de peau avancé.",
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: "Analyseur de Peau - You & Me Beauty",
      description: "Découvrez votre type de peau et recevez des recommandations de produits personnalisées avec notre analyseur de peau avancé.",
      url: "https://youandme.tn/skin-analyzer",
      siteName: "You & Me Beauty",
      locale: "fr_TN",
      type: "website",
      images: [
        {
          url: "https://youandme.tn/og-image.png",
          width: 1200,
          height: 630,
          alt: "You & Me Beauty - Analyseur de Peau IA",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Analyseur de Peau - You & Me Beauty",
      description: "Découvrez votre type de peau et recevez des recommandations de produits personnalisées avec notre analyseur de peau avancé.",
      images: ["https://youandme.tn/og-image.png"],
    },
    keywords: [
      'analyseur de peau',
      'type de peau',
      'soin de la peau',
      'recommandations de produits',
      'cosmétique',
      'beauté',
      'Tunisie'
      
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
  };
}
const SkinAnalyzerFeature = dynamic(
  () => import("@/components/skin-analyzer/skin-analyzer-feature"),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingAnimation size={100} className="text-primary" />
      </div>
    ),
  }
);

export default function SkinAnalyzerPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "name": "Analyseur de Peau IA - You & Me Beauty",
        "url": "https://youandme.tn/skin-analyzer",
        "description": "Analysez votre peau gratuitement avec notre IA et obtenez des recommandations de produits personnalisées.",
        "applicationCategory": "HealthApplication",
        "operatingSystem": "Any",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "TND"
        },
        "featureList": "Détection type de peau, Analyse acné, Recommandation produits"
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Accueil",
            "item": "https://youandme.tn"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Analyseur de Peau",
            "item": "https://youandme.tn/skin-analyzer"
          }
        ]
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SkinAnalyzerFeature />
    </>
  );
}
