import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Contactez-Nous",
    description: "Contactez notre équipe pour toute question ou assistance concernant nos produits de beauté premium. Nous sommes là pour vous aider à trouver les meilleurs soins adaptés à vos besoins.",
    alternates: {
        canonical: "https://youandme.tn/contact",
    },
    openGraph: {
        title: "Contactez-Nous | You & Me Beauty",
        description: "Contactez notre équipe pour toute question ou assistance concernant nos produits de beauté premium.",
        url: "https://youandme.tn/contact",
    },
}

export default function ContactLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>
}
