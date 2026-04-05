import { Metadata } from "next"
import { SHOP_CATEGORIES } from "@/lib/category-data"
import SoldePage from "./page-client"
import { BreadcrumbJsonLd } from "@/components/navigation/breadcrumb"

const categoryKeywords: string[] = Array.from(
    new Set(
        SHOP_CATEGORIES.flatMap((category) => [
            category.label,
            ...(category.subcategories?.flatMap((sub) => [
                sub.label,
                ...(sub.subcategories?.map((child) => child.label) ?? []),
            ]) ?? []),
        ]),
    ),
)

export const metadata: Metadata = {
    title: "Soldes & Promotions - You & Me Beauty | Jusqu'à -50%",
    description:
        "Profitez des meilleures promotions beauté en Tunisie. Découvrez nos soldes sur le maquillage, soins visage, soins corps et cheveux. Offres limitées à ne pas manquer.",
    alternates: {
        canonical: "https://youandme.tn/solde",
    },
    openGraph: {
        title: "Soldes & Promotions - You & Me Beauty | Jusqu'à -50%",
        description:
            "Profitez des meilleures promotions beauté en Tunisie. Maquillage, soins visage, corps et cheveux à prix réduits.",
        url: "https://youandme.tn/solde",
        siteName: "You & Me Beauty",
        locale: "fr_TN",
        type: "website",
        images: [
            {
                url: "https://youandme.tn/og-image.png",
                width: 1200,
                height: 630,
                alt: "Soldes You & Me Beauty - Promotions beauté Tunisie",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Soldes & Promotions - You & Me Beauty | Jusqu'à -50%",
        description:
            "Profitez des meilleures promotions beauté en Tunisie. Offres limitées sur maquillage et soins.",
        images: ["https://youandme.tn/og-image.png"],
    },
    keywords: [
        // Soldes & promotions — intention principale
        "soldes beauté Tunisie",
        "promotions beauté",
        "réductions produits beauté",
        "offres beauté Tunisie",
        "vente flash beauté",
        "destockage beauté",
        "promo maquillage",
        "promo soins visage",
        "promo soins corps",
        "promo soins cheveux",
        "pas cher beauté Tunisie",
        "bon plan beauté",
        "prix réduit beauté",
        "soldes maquillage",
        "soldes skincare",

        // Marques en promo
        "soldes Maybelline",
        "soldes Revolution",
        "soldes Flormar",
        "soldes Essence",
        "promo Doppelherz",
        "promo Avène",
        "promo Arkopharma",

        // Produits soldés — maquillage
        "fond de teint pas cher",
        "mascara promotion",
        "rouge à lèvres soldes",
        "palette ombre à paupières promo",
        "eyeliner pas cher",
        "blush promotion",
        "bronzer soldes",
        "correcteur anti-cernes promo",
        "poudre compacte pas cher",
        "primer maquillage promotion",
        "bb crème promo",
        "cc crème promo",
        "brume fixatrice pas cher",

        // Produits soldés — soins
        "crème hydratante promo",
        "sérum visage promotion",
        "masque beauté soldes",
        "nettoyant visage pas cher",
        "toner promo",
        "contour des yeux soldes",
        "soin corps pas cher",
        "soin cheveux promotion",

        // Marque & site
        "You & Me Beauty soldes",
        "youandme.tn promo",

        // Catégories dynamiques
        ...categoryKeywords,
    ],
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
}

export default function Page() {
    const shopJsonLd = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Soldes & Promotions - You & Me Beauty",
        url: "https://youandme.tn/solde",
        inLanguage: "fr",
        description:
            "Profitez des meilleures promotions beauté en Tunisie. Maquillage, soins visage, corps et cheveux à prix réduits. Offres limitées.",
        isPartOf: {
            "@type": "WebSite",
            name: "You & Me Beauty",
            url: "https://youandme.tn",
        },
        mainEntity: {
            "@type": "ItemList",
            numberOfItems: 0,
            itemListOrder: "https://schema.org/ItemListOrderAscending",
            itemListElement: [],
        },
        potentialAction: {
            "@type": "SearchAction",
            target: "https://youandme.tn/solde?q={search_term_string}",
            "query-input": "required name=search_term_string",
        },
    }

    return (
        <>
            <BreadcrumbJsonLd
                items={[{ name: "Soldes & Promotions", url: "https://youandme.tn/solde" }]}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(shopJsonLd) }}
            />
            <SoldePage />
        </>
    )
}