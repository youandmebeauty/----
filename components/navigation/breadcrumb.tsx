"use client"

import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"
import { cn } from "@/lib/utils/utils"

export interface BreadcrumbItem {
  name: string
  href: string
  current?: boolean
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center space-x-2 text-sm overflow-hidden", className)}>
      <Link 
        href="/" 
        className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
      >
        <Home className="h-4 w-4" />
        <span>Accueil</span>
      </Link>
      
      {items.map((item, index) => (
        <div key={item.href} className="flex items-center space-x-2 ">
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          {item.current ? (
            <span className="font-medium w-fit text-foreground truncate " aria-current="page">
              {item.name}
            </span>
          ) : (
            <Link
              href={item.href}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {item.name}
            </Link>
          )}
        </div>
      ))}
    </nav>
  )
}
