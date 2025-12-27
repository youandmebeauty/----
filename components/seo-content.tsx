import Link from "next/link"
import { MapPin, Sparkles, Package, Truck, Award, ShieldCheck } from "lucide-react"

export function SeoContent() {
  return (
    <section className="py-20 relative overflow-hidden bg-gradient-to-b from-background via-secondary/20 to-background">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-16 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-full mb-6 border border-primary/20">
            <MapPin className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold text-primary tracking-wide">Parapharmacie & Cosmétique • Sfax, Tunisie</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
            Votre Référence Beauté
            <span className="block mt-2 bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              à Sfax
            </span>
          </h2>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Découvrez notre sélection exclusive de produits cosmétiques et parapharmaceutiques, disponibles en ligne avec livraison dans toute la Tunisie
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16 max-w-5xl mx-auto">
          {[
            { icon: Award, label: "100%", sublabel: "Authentique" },
            { icon: Truck, label: "Livraison", sublabel: "Gratuite +200DT" },
            { icon: Package, label: "+500", sublabel: "Produits" },
            { icon: ShieldCheck, label: "Garanti", sublabel: "Qualité" }
          ].map((stat, index) => (
            <div key={index} className="flex flex-col items-center justify-center p-6 bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <stat.icon className="w-8 h-8 text-primary mb-3" />
              <div className="text-2xl font-bold text-foreground">{stat.label}</div>
              <div className="text-sm text-muted-foreground">{stat.sublabel}</div>
            </div>
          ))}
        </div>

        {/* Feature Cards - New Design */}
        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto mb-12">
          {/* Card 1 - Large Featured */}
          <div className="lg:row-span-2 group relative bg-gradient-to-br from-primary/5 via-card/80 to-card/50 backdrop-blur-sm border border-primary/20 rounded-3xl p-8 lg:p-10 hover:shadow-2xl transition-all duration-500 overflow-hidden">
            {/* Animated background effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
            
            <div className="relative space-y-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                <MapPin className="w-8 h-8 text-primary" />
              </div>
              
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                  Parapharmacie & Cosmétique Sfax
                </h3>
                <p className="text-muted-foreground leading-relaxed text-base">
                  <strong className="text-foreground">You & Me Beauty</strong> à <strong className="text-foreground">Sfax</strong>, votre référence en <strong className="text-foreground">parapharmacie et cosmétique</strong>. Retrouvez tous vos produits favoris de <Link href="/shop?category=maquillage" className="text-primary hover:underline font-semibold">maquillage</Link>, <Link href="/shop?category=parfum" className="text-primary hover:underline font-semibold">parfums</Link> et <Link href="/shop?category=soins" className="text-primary hover:underline font-semibold">soins</Link>.
                </p>
              </div>
              
              <div className="pt-4">
                <Link 
                  href="/contact" 
                  className="inline-flex items-center text-primary hover:text-primary/80 font-semibold group/link transition-colors"
                >
                  Nous trouver
                  <svg className="w-4 h-4 ml-2 group-hover/link:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          {/* Card 2 - Authentic Products */}
          <div className="group relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-3xl p-8 hover:shadow-xl transition-all duration-500 overflow-hidden hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative space-y-4">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-xl group-hover:scale-110 transition-transform duration-500">
                <Sparkles className="w-7 h-7 text-amber-600" />
              </div>
              
              <h3 className="text-xl font-bold text-foreground">
                Produits 100% Authentiques
              </h3>
              
              <p className="text-muted-foreground leading-relaxed text-sm">
                Sélection rigoureuse de <strong className="text-foreground">cosmétiques authentiques</strong> certifiés. <Link href="/shop?category=parfum" className="text-primary hover:underline">Parfums originaux</Link>, <Link href="/shop?category=maquillage" className="text-primary hover:underline">maquillage professionnel</Link> et <Link href="/shop?category=outils" className="text-primary hover:underline">accessoires</Link>.
              </p>
            </div>
          </div>

          {/* Card 3 - Delivery */}
          <div className="group relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-3xl p-8 hover:shadow-xl transition-all duration-500 overflow-hidden hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative space-y-4">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl group-hover:scale-110 transition-transform duration-500">
                <Truck className="w-7 h-7 text-blue-600" />
              </div>
              
              <h3 className="text-xl font-bold text-foreground">
                Livraison Rapide en Tunisie
              </h3>
              
              <p className="text-muted-foreground leading-relaxed text-sm">
                Service de <strong className="text-foreground">livraison express</strong> depuis Sfax vers <strong className="text-foreground">Tunis, Sousse, Monastir, Nabeul</strong> et toute la Tunisie. <strong className="text-foreground">Gratuite dès 200 DT</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Link 
            href="/shop" 
            className="group inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-primary to-primary/90 text-white rounded-full font-semibold hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300 hover:scale-105"
          >
            <Package className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
            Découvrir Tous Nos Produits
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          
          <p className="mt-4 text-sm text-muted-foreground">
            Plus de 500 produits disponibles • Livraison gratuite dès 200 DT
          </p>
        </div>
      </div>
    </section>
  )
}
