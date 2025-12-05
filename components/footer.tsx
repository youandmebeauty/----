"use client"

import Link from "next/link"
import { Instagram, Facebook, Twitter } from "lucide-react"
import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { ArrowUp } from "lucide-react"
import Image from "next/image"

export function Footer() {
  const [showScrollTop, setShowScrollTop] = useState(false)
  const { theme } = useTheme()

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="bg-primary/10 dark:bg-primary/20 rounded-3xl m-4 border border-primary/20 mt-20 ">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-1 flex flex-col items-center">
            <Link href="/" className="inline mb-6">
              <span className="text-2xl font-bold tracking-wider text-foreground">You & Me Beauty</span>
              <br />
              <span className="text-sm font-light tracking-wider text-primary">The Beauty for you and me.</span>
            </Link>
            {/* Social Media Links */}
            <div className="flex space-x-4 mt-4">
              <a
                href="https://instagram.com/youandmebeauty"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all duration-300"
              >
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </a>
              <a
                href="https://facebook.com/youandmebeauty"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all duration-300"
              >
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </a>
              <a
                href="https://twitter.com/youandmebeauty"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all duration-300"
              >
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
              <span className="w-1 h-4 bg-primary rounded-full"></span>
              Liens Rapides
            </h3>
            <ul className="space-y-4">
              {[
                { href: "/", label: "Accueil" },
                { href: "/shop", label: "Boutique" },
                { href: "/skin-analyzer", label: "Analyse de Peau" },
                { href: "/contact", label: "Contact" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-primary hover:translate-x-1 transition-all duration-200 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-2">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
              <span className="w-1 h-4 bg-primary rounded-full"></span>
              Informations de Contact
            </h3>
            <div className="grid sm:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-1 text-foreground">Nous Écrire</h4>
                  <a
                    href="mailto:contact@youandmebeauty.tn"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    contact@youandmebeauty.tn
                  </a>
                </div>  
                <div>
                  <h4 className="font-medium mb-1 text-foreground">Nous Appeler</h4>
                  <a href="tel:+21693220902" className="text-muted-foreground hover:text-primary transition-colors">
                    +216 93 220 902
                  </a>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-1 text-foreground">Nous Rendre Visite</h4>
                <p className="text-muted-foreground leading-relaxed">
                  Route Lafrane KM 5.5, Marketing Torki, Sfax Sud
                  <br />
                  Sfax, Tunisie
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-16 pt-8 text-center">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} You & Me Beauty. Tous droits réservés.
          </p>
        </div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 p-4 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 z-50"
          aria-label="Retour en haut"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
    </footer>
  )
}
