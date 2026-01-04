"use client"

import Link from "next/link"
import { Instagram, Facebook } from "lucide-react"
import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { ArrowUp } from "lucide-react"
import Image from "next/image"
// TikTok SVG Icon Component
const TikTokIcon = () => (
  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
)


export function Footer() {
  const [showScrollTop, setShowScrollTop] = useState(false)
  const { theme } = useTheme()

  useEffect(() => {
    let ticking = false
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setShowScrollTop(window.scrollY > 400)
          ticking = false
        })
        ticking = true
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="mt-12 border border-border bg-background rounded-3xl   m-4">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-1 flex flex-col items-center">
            <Link href="/" className="inline">
              {/* <span className="text-2xl font-bold tracking-wider text-foreground">You & Me Beauty</span>
              <br />
              <span className="text-sm font-light tracking-wider text-primary">The Beauty for you and me.</span> */}
              <Image src={theme === "light" ? "/logo.webp" : "/logoB.webp"} alt="Logo" width={200} height={200} />
            </Link>
            {/* Social Media Links */}
            <div className="flex space-x-3 mt-4">
<a
  href="https://instagram.com/youme_beauty_sfax"
  target="_blank"
  rel="noopener noreferrer"
  className={`w-10 h-10 rounded-full border border-border flex items-center justify-center ${
    theme === "light" ? "text-primary" : "text-muted-foreground"
  } hover:border-primary hover:text-primary transition-colors duration-200`}
>
  <Instagram className="h-5 w-5" />
  <span className="sr-only">Instagram</span>
</a>

<a
  href="https://www.facebook.com/people/YOUME-Beauty/61578933269826/"
  target="_blank"
  rel="noopener noreferrer"
  className={`w-10 h-10 rounded-full border border-border flex items-center justify-center ${
    theme === "light" ? "text-primary" : "text-muted-foreground"
  } hover:border-primary hover:text-primary transition-colors duration-200`}
>
  <Facebook className="h-5 w-5" />
  <span className="sr-only">Facebook</span>
</a>

<a
  href="https://www.tiktok.com/@youmebeauty"
  target="_blank"
  rel="noopener noreferrer"
  className={`w-10 h-10 rounded-full border border-border flex items-center justify-center ${
    theme === "light" ? "text-primary" : "text-muted-foreground"
  } hover:border-primary hover:text-primary transition-colors duration-200`}
>
  <TikTokIcon />
  <span className="sr-only">TikTok</span>
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
                    href="mailto:youandme282@gmail.com"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    youandme282@gmail.com
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
                  Route Lafrane KM 5.5, Markez Torki, Sfax Sud
                  <br />
                  Sfax, Tunisie
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-8 text-center">
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
