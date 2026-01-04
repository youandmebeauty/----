import { Metadata } from "next"
import ContactPage from "./page-client"
import React from "react"

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
        siteName: "You & Me Beauty",
        locale: "fr_TN",
        type: "website",
        images: [
            {
                url: "https://youandme.tn/og-image.png",
                width: 1200,
                height: 630,
                alt: "You & Me Beauty - Contactez-Nous",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Contactez-Nous - You & Me Beauty",
        description: "Contactez notre équipe pour toute question ou assistance concernant nos produits de beauté premium.",
        images: ["https://youandme.tn/og-image.png"],
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

export default function Page() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "ContactPage",
                "name": "Contactez You & Me Beauty",
                "description": "Contactez notre équipe d'experts pour toute question sur nos produits ou pour des conseils beauté personnalisés.",
                "url": "https://youandme.tn/contact",
                "mainEntity": {
                    "@type": "BeautySalon",
                    "name": "You & Me Beauty",
                    "image": "https://youandme.tn/logo.webp",
                    "telephone": "+216 93 220 902",
                    "email": "youandme282@gmail.com",
                    "address": {
                        "@type": "PostalAddress",
                        "streetAddress": "Route Lafrane KM 5.5, Markez Torki, Sfax Sud",
                        "addressLocality": "Sfax",
                        "addressCountry": "TN"
                    },
                    "openingHoursSpecification": {
                        "@type": "OpeningHoursSpecification",
                        "dayOfWeek": [
                            "Monday",
                            "Tuesday",
                            "Wednesday",
                            "Thursday",
                            "Friday",
                            "Saturday",
                            "Sunday"
                        ],
                        "opens": "09:00",
                        "closes": "19:00"
                    }
                }
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
                        "name": "Contact",
                        "item": "https://youandme.tn/contact"
                    }
                ]
            }
        ]
    }

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <ContactPage />
        </>
    )
}