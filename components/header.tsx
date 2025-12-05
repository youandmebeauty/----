"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { useCart } from "./cart-provider"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Moon, Sun, ShoppingBag, Menu, Search, X } from "lucide-react"
import GlassSurface from "./GlassSurface"

export function Header() {
  const { theme, setTheme } = useTheme()
  const { itemCount, isLoading } = useCart()
  const [isOpen, setIsOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [scrolled, setScrolled] = useState(false)
  const router = useRouter()
  const searchInputRef = useRef<HTMLInputElement>(null)

  const navigation = [
    { name: "Accueil", href: "/" },
    { name: "Boutique", href: "/shop" },
    { name: "Analyseur de peau", href: "/skin-analyzer" },
    { name: "Contact", href: "/contact" },
  ]

  // Handle scroll for adaptive header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false)
  }, [router])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery("")
      setIsSearchOpen(false)
    }
  }

  return (
    <header className={`sticky ${scrolled ? 'top-2' : 'top-4'} z-50 w-full flex justify-center px-4 transition-all duration-300`}>
      <GlassSurface
        displace={0.5}
        distortionScale={-180}
        redOffset={0}
        saturation={1}
        greenOffset={10}
        blueOffset={20}
        blur={11}
        brightness={50}
        opacity={0.93}
        backgroundOpacity={0.1}
        mixBlendMode="screen"
        width="70%"
        height={scrolled ? "70px" : "80px"}
        borderRadius={50}
        borderWidth={0.07}
        className="transition-all duration-300"
      >
        <div className="container mx-auto px-3 sm:px-4">
          <div className={`flex ${scrolled ? 'h-[70px]' : 'h-20'} items-center justify-between relative transition-all duration-300`}>
            {isSearchOpen ? (
              <div className="w-full h-full flex items-center animate-in fade-in zoom-in-95 duration-200">
                <Search className="h-5 w-5 text-muted-foreground mr-2 sm:mr-4 flex-shrink-0" />
                <form onSubmit={handleSearch} className="flex-1 min-w-0">
                  <Input
                    ref={searchInputRef}
                    type="search"
                    placeholder="Rechercher..."
                    className="w-full border-none h-12 text-base sm:text-lg bg-transparent focus-visible:ring-0 px-0 placeholder:text-muted-foreground/50"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                  />
                </form>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="ml-2 sm:ml-4 hover:bg-secondary/50 rounded-full flex-shrink-0"
                  onClick={() => setIsSearchOpen(false)}
                >
                  <X className="h-5 w-5" />
                  <span className="sr-only">Fermer</span>
                </Button>
              </div>
            ) : (
              <>
                {/* Logo - Always visible on mobile */}
                <Link href="/" className="flex items-center space-x-3 flex-shrink-0">
                  <img
                    src={theme == "light" ? "/logo-light.svg" : "/logo-white.svg"}
                    alt="You&Me Beauty Logo" 
                    className={`${scrolled ? 'h-12 md:h-14' : 'h-14 md:h-16'} w-auto transition-all duration-300`}
                  />
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center space-x-8 lg:space-x-12">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="text-sm font-bold uppercase tracking-widest text-foreground hover:text-primary transition-colors whitespace-nowrap"
                    >
                      {item.name}
                    </Link>
                  ))}
                </nav>

                {/* Actions */}
                <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4">
                  {/* Search Trigger */}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setIsSearchOpen(true)} 
                    className="hover:bg-primary/10 hover:text-primary transition-colors h-9 w-9 sm:h-10 sm:w-10"
                  >
                    <Search className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="sr-only">Rechercher</span>
                  </Button>

                  {/* Theme Switcher - Hidden on small mobile */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                    className="hidden md:flex hover:bg-transparent hover:text-primary h-9 w-9 sm:h-10 sm:w-10"
                  >
                    <Sun className="h-4 w-4 sm:h-5 sm:w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-4 w-4 sm:h-5 sm:w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Changer de thème</span>
                  </Button>

                  {/* Cart */}
                  <Link href="/cart" className="flex-shrink-0">
                    <Button variant="ghost" size="icon" className="relative hover:bg-transparent hover:text-primary h-9 w-9 sm:h-10 sm:w-10">
                      <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5" />
                      {!isLoading && itemCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-[10px] flex items-center justify-center bg-primary text-primary-foreground border-2 border-background">
                          {itemCount > 9 ? '9+' : itemCount}
                        </Badge>
                      )}
                      <span className="sr-only">Panier ({itemCount})</span>
                    </Button>
                  </Link>

                  {/* Mobile Menu */}
                  <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="icon" className="md:hidden hover:bg-transparent  hover:text-primary h-9 w-9 sm:h-10 sm:w-10">
                        <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
                        <span className="sr-only">Menu</span>
                      </Button>
                    </SheetTrigger>
                    <SheetContent 
                      side="right" 
                      className="w-full sm:w-[400px] p-0 text-white/90 border-none bg-transparent"
                      onInteractOutside={(e) => {
                        e.preventDefault()
                        setIsOpen(false)
                      }}
                    >
                      <GlassSurface
                        displace={0.5}
                        distortionScale={-180}
                        redOffset={0}
                        saturation={1}
                        greenOffset={10}
                        blueOffset={20}
                        blur={11}
                        brightness={50}
                        opacity={0.93}
                        backgroundOpacity={0.1}
                        mixBlendMode="screen"
                        className="w-full h-full"
                        borderRadius={0}
                        borderWidth={0.07}
                      >
                        <div className="flex flex-col h-full">
                          <div className="p-6 border-b border-white/50 mt-16">
                            <SheetTitle className="text-3xl text-white/90 font-bold uppercase">Menu</SheetTitle>
                            <SheetDescription className="sr-only">Menu de navigation principal</SheetDescription>
                          </div>
                          
                          <nav className="flex flex-col p-6 gap-6 mt-8">
                            {navigation.map((item, index) => (
                              <Link
                                key={item.name}
                                href={item.href}
                                className="text-2xl font-bold uppercase tracking-tight text-white/90 hover:text-primary active:scale-95 transition-all"
                                onClick={() => setIsOpen(false)}
                                style={{
                                  animationDelay: `${index * 50}ms`,
                                  animation: 'slideInRight 0.3s ease-out forwards'
                                }}
                              >
                                {item.name}
                              </Link>
                            ))}
                          </nav>

                          {/* Mobile-only theme toggle in menu */}
                          <div className="xs:hidden p-6 mt-auto border-t text-white/90 border-white/50">
                            <Button
                              variant="outline"
                              size="lg"
                              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                              className="w-full justify-start gap-3 bg-transparent hover:bg-white/10 border-white/50"
                            >
                              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                              <Moon className="absolute left-9 h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                              <span className="ml-6">Changer de thème</span>
                            </Button>
                          </div>
                        </div>
                      </GlassSurface>
                    </SheetContent>
                  </Sheet>
                </div>
              </>
            )}
          </div>
        </div>
      </GlassSurface>

      <style jsx global>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @media (min-width: 400px) {
          .xs\\:flex {
            display: flex;
          }
          .xs\\:hidden {
            display: none;
          }
        }
      `}</style>
    </header>
  )
}