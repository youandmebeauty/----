import { Metadata } from "next"
import OrderConfirmationContent from "./order-confirmation-content"

export const metadata: Metadata = {
  title: "Confirmation de commande",
  description: "Votre commande a été confirmée. Découvrez d'autres produits ou retournez à l'accueil.",
  alternates: {
    canonical: "https://youandme.tn/order-confirmation",
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
    title: "Confirmation de commande - You & Me Beauty",
    description: "Commande validée. Merci pour votre achat !",
    url: "https://youandme.tn/order-confirmation",
  },
}

export default function OrderConfirmationPage() {
  return <OrderConfirmationContent />
}
