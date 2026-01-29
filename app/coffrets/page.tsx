import { Metadata } from "next"
import { SHOP_CATEGORIES } from "@/lib/category-data"
import CoffretPage from "./page-client"
import { BreadcrumbJsonLd } from "@/components/breadcrumb"

// Génère une liste de mots-clés à partir des catégories et sous-catégories
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
    title: "Nos Packs  - You & Me Beauty",
  description: "Découvrez notre collection de coffrets cadeaux soigneusement sélectionnés. Des ensembles parfaits pour offrir ou se faire plaisir.",
    alternates: {
        canonical: "https://youandme.tn/coffrets",
    },
    openGraph: {
        title: "Nos Packs  - You & Me Beauty",
        description: "Découvrez notre collection de coffrets cadeaux soigneusement sélectionnés.",
        url: "https://youandme.tn/coffrets",
        siteName: "You & Me Beauty",
        locale: "fr_TN",
        type: "website",
        images: [
            {
                url: "https://youandme.tn/og-image.png",
                width: 1200,
                height: 630,
                alt: "You & Me Beauty - Boutique",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Nos Packs  - You & Me Beauty",
        description: "Découvrez notre collection de coffrets cadeaux soigneusement sélectionnés.",
        images: ["https://youandme.tn/og-image.png"],
    },
    keywords: [
        "boutique de beauté",
        "produits de beauté",
        "soins du visage",
        "maquillage",
        "You & Me Beauty",
        "Tunisie",
        "fond de teint",
        "correcteur",
        "poudre compacte",
        "blush",
        "bronzer",
        "mascara",
        "eyeliner",
        "rouge à lèvres",
        "ombre à paupières",
        "soin du corps",
        "soin des cheveux",
        "crème hydratante",
        "sérum visage",
        "masque beauté",
        "nettoyant visage",
        "toner",
        "contour des yeux",
        "primer maquillage",
        "base maquillage",
        "bb crème",
        "cc crème",
        "correcteur anti-cernes",
        "poudre matifiante",
        "brume fixatrice",
        "Maybelline",
        "Revolution",
        "Flormar",
        "Essence",
        "doppelherz",
        "avene",
        "arkopharma",
        ...categoryKeywords,
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
    const shopJsonLd = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Nos Packs  - You & Me Beauty",
        url: "https://youandme.tn/coffrets",
        inLanguage: "fr",
        description: "Découvrez notre collection de coffrets cadeaux soigneusement sélectionnés. Des ensembles parfaits pour offrir ou se faire plaisir.",
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

    }

    return (
        <>
            <BreadcrumbJsonLd items={[{ name: "Coffrets", url: "https://youandme.tn/coffrets" }]} />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(shopJsonLd) }}
            />           
            <CoffretPage />
        </>
    )
}