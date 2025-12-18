import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Panier",
  description: "Vérifiez vos articles, appliquez un code promo et finalisez votre commande chez You & Me Beauty.",
  alternates: {
    canonical: "https://youandme.tn/cart",
  },
  robots: {
    index: false,
    follow: true,
    googleBot: {
      index: false,
      follow: true,
    },
  },
  openGraph: {
    title: "Panier | You & Me Beauty",
    description: "Vérifiez vos articles et validez votre commande.",
    url: "https://youandme.tn/cart",
  },
}

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
