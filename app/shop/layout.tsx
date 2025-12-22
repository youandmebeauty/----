import { Metadata } from "next"
import { SHOP_CATEGORIES } from "@/lib/category-data"

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
    title: "Boutique - You & Me Beauty",
    description: "Explorez notre boutique complète de produits de beauté. Filtrez par catégorie, type de peau et prix pour trouver votre routine idéale.",
    alternates: {
        canonical: "https://youandme.tn/shop",
    },
    openGraph: {
        title: "Boutique | You & Me Beauty",
        description: "Explorez notre boutique complète de produits de beauté.",
        url: "https://youandme.tn/shop",
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

export default function ShopLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>
}
