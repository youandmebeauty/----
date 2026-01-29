"use client"

import type React from "react"
import { useState, useRef, useEffect, useMemo } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { useCart } from "./cart-provider"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Moon, Sun, ShoppingBag, Menu, Search, X } from "lucide-react"
import GlassSurface from "./GlassSurface"
import { gsap } from "@/lib/gsap"
import { AnnounceOffre } from "./announceOffre"
import { useSaintValentin } from "@/components/coffret/saint-valentin-provider"

export function Header() {
  const { theme, setTheme } = useTheme()
  const { itemCount, isLoading } = useCart()
  const [isOpen, setIsOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [scrolled, setScrolled] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const searchInputRef = useRef<HTMLInputElement>(null)
  const animatedContentRef = useRef<HTMLDivElement | null>(null)
  const badgeRef = useRef<HTMLDivElement | null>(null)
  const mobileNavRef = useRef<HTMLUListElement | null>(null)
  const mobileThemeRef = useRef<HTMLDivElement | null>(null)
const { saintValentin } = useSaintValentin();
  const navigation = [
    { name: "Accueil", href: "/" },
    { name: "Boutique", href: "/shop" },
    { name: "Analyseur de peau", href: "/skin-analyzer" },
    { name: "Contact", href: "/contact" },
  ]

  const containerStyle = useMemo(
    () => ({
      width: "70%",
      transform: scrolled ? "translateY(-8px) scale(0.95)" : "translateY(0) scale(1)",
      transition: "transform 0.35s cubic-bezier(0.25, 0.4, 0.25, 1)",
    }),
    [scrolled]
  )

  // Handle scroll for adaptive header
  useEffect(() => {
    let ticking = false
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrolled(window.scrollY > 20)
          ticking = false
        })
        ticking = true
      }
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  useEffect(() => {
    const container = animatedContentRef.current
    if (!container) return

    const target = container.firstElementChild as HTMLElement | null
    if (!target) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        target,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.2, ease: "power1.out" }
      )
    }, target)

    return () => ctx.revert()
  }, [isSearchOpen])

  useEffect(() => {
    if (!itemCount || itemCount <= 0) return

    const badge = badgeRef.current
    if (!badge) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        badge,
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(1.7)" }
      )
    }, badge)

    return () => ctx.revert()
  }, [itemCount])

  useEffect(() => {
    if (!isOpen) return

    const list = mobileNavRef.current
    const themeContainer = mobileThemeRef.current
    if (!list) return

    const items = Array.from(list.children) as HTMLElement[]

    const ctx = gsap.context(() => {
      gsap.fromTo(
        items,
        { opacity: 0, x: 20 },
        { opacity: 1, x: 0, duration: 0.3, ease: "power2.out", stagger: 0.05 }
      )

      if (themeContainer) {
        gsap.fromTo(
          themeContainer,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.3,
            ease: "power2.out",
            delay: items.length * 0.05 + 0.1,
          }
        )
      }
    }, list)

    return () => ctx.revert()
  }, [isOpen])



  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (searchQuery.trim()) {
        router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`)
        setSearchQuery("")
        setIsSearchOpen(false)
      }
    }
  }



  return (
    
    <header className="sticky top-4 z-50  flex flex-col items-center justify-center ">
      {saintValentin && <AnnounceOffre />}
      <div style={containerStyle}>
        <GlassSurface
          displace={1}
          distortionScale={-180}
          redOffset={20}
          saturation={1}
          greenOffset={10}
          blueOffset={20}
          blur={10}
          brightness={50}
          opacity={0.9}
          backgroundOpacity={0.2}
          mixBlendMode="darken"
          width="100%"
          height="70px"
          borderRadius={50}
          borderWidth={0.07}
        >
          <div className="container mx-auto px-3 sm:px-4">
            <div className="flex h-20 items-center justify-between relative">
              <div ref={animatedContentRef} className="w-full">
                {isSearchOpen ? (
                  <div key="search" className="flex h-full w-full items-center">
                    <Search className="h-5 w-5 text-muted-foreground mr-2 sm:mr-4 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <Input
                        ref={searchInputRef}
                        type="search"
                        placeholder="Rechercher..."
                        className="w-full border-none h-12 text-base sm:text-lg bg-transparent focus-visible:ring-0 px-0 placeholder:text-muted-foreground/50"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleSearchKeyDown}
                        autoFocus
                      />
                    </div>
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
                  <div key="header" className="flex w-full items-center justify-between">
                    {/* Logo - Always visible on mobile */}
                    <Link 
                      href="/" 
                      className="flex items-center space-x-3 flex-shrink-0"
                    >
                      <img
                        src={theme == "light" ? "/logo-light.webp" : "/logo-white.webp"}
                        alt="You&Me Beauty Logo"
                        className="h-10 md:h-12 w-auto"
                      />
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center">
                      <ul className="flex items-center space-x-8 lg:space-x-12">
                        {navigation.map((item) => (
                          <li key={item.name}>
                            <Link
                              href={item.href}
                              className="text-sm font-medium uppercase text-foreground hover:text-primary transition-colors whitespace-nowrap"
                            >
                              {item.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </nav>

                    {/* Actions */}
                    <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4 lg:space-x-6">
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
                      <Link 
                        href="/cart" 
                        className="flex-shrink-0"
                      >
                        <Button variant="ghost" size="icon" className="relative hover:bg-transparent hover:text-primary h-9 w-9 sm:h-10 sm:w-10">
                          <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5" />
                          {!isLoading && itemCount > 0 && (
                            <div ref={badgeRef} className="absolute -top-1 -right-1">
                              <Badge className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-background bg-primary p-0 text-[10px] text-primary-foreground">
                                {itemCount > 9 ? '9+' : itemCount}
                              </Badge>
                            </div>
                          )}
                          <span className="sr-only">Panier ({itemCount})</span>
                        </Button>
                      </Link>

                      {/* Mobile Menu */}
                      <Sheet open={isOpen} onOpenChange={setIsOpen}>
                        <SheetTrigger asChild>
                          <Button variant="ghost" size="icon" className="lg:hidden hover:bg-transparent hover:text-primary h-9 w-9 sm:h-10 sm:w-10">
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
                              
                              <nav className="flex flex-col p-6 mt-8">
                                <ul ref={mobileNavRef} className="flex flex-col gap-6">
                                  {navigation.map((item) => (
                                    <li key={item.name}>
                                      <Link
                                        href={item.href}
                                        className="text-2xl font-semibold uppercase tracking-tight text-white/90 hover:text-primary active:scale-95 transition-all block"
                    
                                      >
                                        {item.name}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              </nav>

                              {/* Mobile-only theme toggle in menu */}
                              <div
                                ref={mobileThemeRef}
                                className="md:hidden p-6  m-auto border-t"
                              >
                                <Button
                                  variant="outline"
                                  size="lg"
                                  onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                                  className="w-full z-50 justify-start gap-3 bg-transparent active:scale-95"
                                >
                                  <div className="relative w-5 h-5 flex items-center justify-center">
                                    <Sun className="h-5 w-5 absolute rotate-0 scale-100 transition-all duration-500 dark:-rotate-90 dark:scale-0" />
                                    <Moon className="h-5 w-5 absolute rotate-90 scale-0 transition-all duration-500 dark:rotate-0 dark:scale-100" />
                                  </div>
                                  <span>Changer de thème</span>
                                </Button>
                              </div>
                            </div>
                          </GlassSurface>
                        </SheetContent>
                      </Sheet>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </GlassSurface>
      </div>

      <style jsx global>{`
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