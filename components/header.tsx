"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { motion, AnimatePresence } from "framer-motion"
import { useCart } from "./cart-provider"
import { useLoading } from "./loading-provider"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Moon, Sun, ShoppingBag, Menu, Search, X } from "lucide-react"
import GlassSurface from "./GlassSurface"

export function Header() {
  const { theme, setTheme } = useTheme()
  const { itemCount, isLoading } = useCart()
  const { setIsLoading: setGlobalLoading } = useLoading()
  const [isOpen, setIsOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [scrolled, setScrolled] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const searchInputRef = useRef<HTMLInputElement>(null)

  const navigation = [
    { name: "Accueil", href: "/" },
    { name: "Boutique", href: "/shop" },
    { name: "Analyseur de peau", href: "/skin-analyzer" },
    { name: "Contact", href: "/contact" },
  ]

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



  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (searchQuery.trim()) {
        setGlobalLoading(true)
        router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`)
        setSearchQuery("")
        setIsSearchOpen(false)
      }
    }
  }

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    // Only show loading if navigating to a different page
    if (pathname !== href) {
      setGlobalLoading(true)
    }
  }

  return (
    <header className="sticky top-4 z-50 w-full flex justify-center px-4">
      <motion.div
        initial={false}
        animate={{
          scale: scrolled ? 0.95 : 1,
          y: scrolled ? -8 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 40,
          mass: 0.5,
        }}
        style={{ width: "70%" }}
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
          width="100%"
          height="70px"
          borderRadius={50}
          borderWidth={0.07}
        >
          <div className="container mx-auto px-3 sm:px-4">
            <div className="flex h-20 items-center justify-between relative">
              <AnimatePresence mode="wait">
                {isSearchOpen ? (
                  <motion.div
                    key="search"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="w-full h-full flex items-center"
                  >
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
                  </motion.div>
                ) : (
                  <motion.div
                    key="header"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="w-full flex items-center justify-between"
                  >
                    {/* Logo - Always visible on mobile */}
                    <Link 
                      href="/" 
                      className="flex items-center space-x-3 flex-shrink-0"
                      onClick={(e) => handleNavClick(e, "/")}
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
                              onClick={(e) => handleNavClick(e, item.href)}
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
                        onClick={(e) => handleNavClick(e, "/cart")}
                      >
                        <Button variant="ghost" size="icon" className="relative hover:bg-transparent hover:text-primary h-9 w-9 sm:h-10 sm:w-10">
                          <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5" />
                          <AnimatePresence>
                            {!isLoading && itemCount > 0 && (
                              <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                              >
                                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-[10px] flex items-center justify-center bg-primary text-primary-foreground border-2 border-background">
                                  {itemCount > 9 ? '9+' : itemCount}
                                </Badge>
                              </motion.div>
                            )}
                          </AnimatePresence>
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
                                <ul className="flex flex-col gap-6">
                                  {navigation.map((item, index) => (
                                    <motion.li
                                      key={item.name}
                                      initial={{ opacity: 0, x: 20 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{
                                        delay: index * 0.05,
                                        type: "spring",
                                        stiffness: 400,
                                        damping: 30,
                                      }}
                                    >
                                      <Link
                                        href={item.href}
                                        className="text-2xl font-semibold uppercase tracking-tight text-white/90 hover:text-primary active:scale-95 transition-all block"
                                        onClick={(e) => {
                                          handleNavClick(e, item.href)
                                          setIsOpen(false)
                                        }}
                                      >
                                        {item.name}
                                      </Link>
                                    </motion.li>
                                  ))}
                                </ul>
                              </nav>

                              {/* Mobile-only theme toggle in menu */}
                              <motion.div
                                className="md:hidden p-6 mt-auto border-t text-white/90 border-white/50"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                  delay: navigation.length * 0.05 + 0.1,
                                  type: "spring",
                                  stiffness: 400,
                                  damping: 30,
                                }}
                              >
                                <Button
                                  variant="outline"
                                  size="lg"
                                  onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                                  className="w-full justify-start gap-3 bg-transparent hover:bg-white/10 border-white/50 text-white/90 hover:text-white transition-all active:scale-95"
                                >
                                  <div className="relative w-5 h-5 flex items-center justify-center">
                                    <Sun className="h-5 w-5 absolute rotate-0 scale-100 transition-all duration-500 dark:-rotate-90 dark:scale-0" />
                                    <Moon className="h-5 w-5 absolute rotate-90 scale-0 transition-all duration-500 dark:rotate-0 dark:scale-100" />
                                  </div>
                                  <span>Changer de thème</span>
                                </Button>
                              </motion.div>
                            </div>
                          </GlassSurface>
                        </SheetContent>
                      </Sheet>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </GlassSurface>
      </motion.div>

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