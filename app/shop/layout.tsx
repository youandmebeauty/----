import { Metadata } from "next"

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
}

export default function ShopLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>
}
