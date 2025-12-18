import type React from "react"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Admin",
  description: "Zone d'administration You & Me Beauty.",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
