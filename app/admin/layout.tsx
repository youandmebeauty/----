import type React from "react"
import { Metadata } from "next"
import Sidebar from "@/components/admin/sidebar"
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
  return( <div className="flex  gap-5 w-full min-h-screen "><Sidebar />{children}</div>)
}
