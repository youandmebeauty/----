import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Analyse de Peau IA",
    description: "Analysez votre peau gratuitement avec notre IA avancée. Détectez vos besoins et obtenez une routine de soins personnalisée en quelques secondes.",
    openGraph: {
        title: "Analyse de Peau IA | You & Me Beauty",
        description: "Analysez votre peau gratuitement avec notre IA avancée.",
        url: "https://youandme.tn/skin-analyzer",
    },
}

export default function SkinAnalyzerLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>
}
