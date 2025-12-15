import { Metadata } from "next";
import dynamic from "next/dynamic";
import { LoadingAnimation } from "@/components/ui/loading-animation";
// Remove Loader2 import or keep if used elsewhere (it's not used elsewhere in this file)
export async function generateMetadata({ 
}: {}): Promise<Metadata> {
    const canonicalUrl = `https://youandme.tn/skin-analyzer`;

  return {
    title: "Analyseur de Peau",
    description: "Découvrez votre type de peau et recevez des recommandations de produits personnalisées avec notre analyseur de peau avancé.",
alternates: {
      canonical: canonicalUrl,
    },    openGraph: {
      title: "Analyseur de Peau",
      description: "Découvrez votre type de peau et recevez des recommandations de produits personnalisées avec notre analyseur de peau avancé.",
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
  return <SkinAnalyzerFeature />;
}