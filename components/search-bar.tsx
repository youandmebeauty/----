"use client"

import { useState, useEffect } from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useRouter, useSearchParams } from "next/navigation"

interface SearchBarProps {
    onSearch?: (query: string) => void
    placeholder?: string
    className?: string
}

export function SearchBar({ onSearch, placeholder = "Rechercher des produits...", className = "" }: SearchBarProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [query, setQuery] = useState(searchParams.get("search") || "")

    useEffect(() => {
        setQuery(searchParams.get("search") || "")
    }, [searchParams])

    const handleSearch = (value: string) => {
        setQuery(value)

        if (onSearch) {
            onSearch(value)
        } else {
            // Update URL with search query
            const params = new URLSearchParams(searchParams.toString())
            if (value) {
                params.set("search", value)
            } else {
                params.delete("search")
            }
            router.push(`/shop?${params.toString()}`)
        }
    }

    const clearSearch = () => {
        handleSearch("")
    }

    return (
        <div className={`relative ${className}`}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
                type="text"
                placeholder={placeholder}
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 pr-10 bg-background/50 border-border/50 focus:border-primary transition-colors"
            />
            {query && (
                <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Clear search"
                >
                    <X className="h-4 w-4" />
                </button>
            )}
        </div>
    )
}
