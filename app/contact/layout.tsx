import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Contactez-Nous - You & Me Beauty",
    description: "Contactez notre équipe pour toute question ou assistance concernant nos produits de beauté premium. Nous sommes là pour vous aider à trouver les meilleurs soins adaptés à vos besoins.",
    alternates: {
        canonical: "https://youandme.tn/contact",
    },
    openGraph: {
        title: "Contactez-Nous - You & Me Beauty",
        description: "Contactez notre équipe pour toute question ou assistance concernant nos produits de beauté premium.",
        url: "https://youandme.tn/contact",
    },
    keywords: [
        "contact",
        "service client",   
        "assistance",
        "produits de beauté",
        "soins du visage",
        "You & Me Beauty",
        "Tunisie"
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

export default function ContactLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>
}
