"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Menu, X } from "lucide-react"
import type React from "react"

export default function Sidebar({ className = "" }: { className?: string }) {
  const pathname = usePathname() || ""
  const [open, setOpen] = useState(false)

  const items: { href: string; label: string }[] = [
    { href: "/admin/dashboard", label: "Tableau de bord" },
    { href: "/admin/orders", label: "Commandes" },
    { href: "/admin/products", label: "Produits" },
    { href: "/admin/coffrets", label: "Coffrets" },
    { href: "/admin/promos", label: "Codes Promo" },
  ]

  // Hide sidebar on the admin login page
  if (pathname === "/admin/login" || pathname.startsWith("/admin/login")) return null

  useEffect(() => {
    // Show sidebar by default on md+ screens, hide on small screens
    const mq = window.matchMedia("(min-width: 768px)")
    const apply = () => setOpen(mq.matches)
    apply()
    mq.addEventListener?.("change", apply)
    return () => mq.removeEventListener?.("change", apply)
  }, [])

  const renderNavContent = () => (
    <nav className="space-y-12 h-screen  ">
      <h3 className="font-serif text-5xl mb-2 text-center text-primary">Admin</h3>
      <ul className="flex items-center flex-col gap-4 ">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`block px-3 py-2 rounded-md text-2xl transition-colors ${active ? "bg-primary/10 font-medium" : "hover:bg-primary/5"}`}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )

  return (
    <>
      {/* Mobile toggle button */}
      <button
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
        className="fixed top-4 left-4 z-50 p-2 rounded-md bg-background/70 border border-border/50 md:hidden"
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Desktop sidebar */}
      <aside className={`hidden md:block sticky z-40 top-4 bg-background w-64 h-[90vh] rounded-2xl border border-border/50 p-4 ${className}`}>
        {renderNavContent()}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40  md:hidden">
          <div className="absolute  left-0 top-0 bottom-0 w-full p-4 bg-background/90 backdrop-blur border-r border-border/50">
            {renderNavContent()}
          </div>
        </div>
      )}
    </>
  )
}