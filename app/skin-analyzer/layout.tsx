import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Analyseur de Peau IA Gratuit",
    description: "Analysez votre peau gratuitement avec notre intelligence artificielle avancée. Détectez acné, rides, taches et recevez des recommandations de produits personnalisées instantanément.",
    keywords: ["analyse peau IA", "diagnostic peau gratuit", "analyseur visage", "AI skin analyzer", "détection acné", "analyse beauté"],
    openGraph: {
        title: "Analyseur de Peau IA Gratuit | You & Me Beauty",
        description: "Découvrez les besoins de votre peau en quelques secondes grâce à l'IA. Analyse gratuite et recommandations personnalisées.",
        url: "https://youandme.tn/skin-analyzer",
        type: "website",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "Analyseur de Peau IA - You & Me Beauty",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Analyseur de Peau IA Gratuit",
        description: "Analyse de peau par IA + recommandations personnalisées",
        images: ["/og-image.png"],
    },
}

export default function SkinAnalyzerLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>
}
