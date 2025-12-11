"use client"

import Link from "next/link"
import { useTheme } from "next-themes"
import { Sparkles, Heart, Package, Award, Shield, Truck, ArrowRight } from "lucide-react"
import { ScrollAnimation } from "./scroll-animation"
import Image from "next/image"

const values = [
    {
        icon: Package,
        title: "Large Sélection",
        description: "Des centaines de marques de beauté premium et produits cosmétiques soigneusement sélectionnés",
        gradient: "from-pink-500/10 via-rose-500/10 to-purple-500/10",
        iconBg: "bg-gradient-to-br from-pink-500/20 to-rose-500/20",
    },
    {
        icon: Award,
        title: "Marques Authentiques",
        description: "Uniquement des produits originaux des meilleures marques mondiales certifiées",
        gradient: "from-amber-500/10 via-orange-500/10 to-red-500/10",
        iconBg: "bg-gradient-to-br from-amber-500/20 to-orange-500/20",
    },
    {
        icon: Shield,
        title: "Garantie Qualité",
        description: "Tous nos produits sont certifiés et garantis 100% authentiques avec traçabilité complète",
        gradient: "from-emerald-500/10 via-teal-500/10 to-cyan-500/10",
        iconBg: "bg-gradient-to-br from-emerald-500/20 to-teal-500/20",
    },
    {
        icon: Sparkles,
        title: "Nouveautés",
        description: "Les dernières tendances et nouveaux produits beauté ajoutés régulièrement à notre catalogue",
        gradient: "from-violet-500/10 via-purple-500/10 to-fuchsia-500/10",
        iconBg: "bg-gradient-to-br from-violet-500/20 to-purple-500/20",
    },
    {
        icon: Truck,
        title: "Livraison Rapide",
        description: "Livraison gratuite dès 100 TND partout en Tunisie avec suivi en temps réel",
        gradient: "from-blue-500/10 via-indigo-500/10 to-violet-500/10",
        iconBg: "bg-gradient-to-br from-blue-500/20 to-indigo-500/20",
    },
    {
        icon: Heart,
        title: "Service Client",
        description: "Conseils personnalisés et support client dédié disponible 7j/7 pour vous accompagner",
        gradient: "from-red-500/10 via-pink-500/10 to-rose-500/10",
        iconBg: "bg-gradient-to-br from-red-500/20 to-pink-500/20",
    },
]

export function WhyChooseUs() {
    const { theme } = useTheme()

    return (
        <section className="py-20 mt-24 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-b from-secondary/50 via-background to-background/50 rounded-3xl m-4"></div>
            <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>

            <div className="container mx-auto px-4 relative z-10">
                {/* Header */}
                <div className="text-center mb-20">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span className="text-xs font-medium tracking-widest text-primary uppercase">
                            Nos Engagements
                        </span>
                    </div>

                    <h2 className="font-serif text-5xl md:text-6xl lg:text-7xl font-medium mb-6 text-foreground">
                        Pourquoi <br /> <span className="italic text-primary">You&me Beauty</span>
                    </h2>

                    <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-light">
                        Votre destination beauté de confiance pour toutes les grandes marques cosmétiques internationales
                    </p>
                </div>

                {/* Values Grid */}
                <div className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-3  gap-6 lg:gap-8 mb-20">
                    {values.map((value, index) => {
                        const Icon = value.icon
                        return (
                            <ScrollAnimation
                                key={index}
                                variant="slideUp"
                                delay={index * 0.1}
                            >
                                <div
                                    className="group sticky bg-card/50 h-full backdrop-blur-sm border border-border/50 rounded-3xl p-8 lg:p-10 shadow-lg hover:shadow-2xl transition-all duration-700 hover:-translate-y-3 overflow-hidden"
                                    style={{
                                        top: `calc(8rem + ${index * 1.5}rem)`,
                                        zIndex: values.length - index,
                                        animationDelay: `${index * 100}ms`
                                    }}
                                >
                                    {/* Animated gradient background */}
                                    <div className={`absolute inset-0 bg-gradient-to-br ${value.gradient} rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700`}></div>

                                    {/* Shine effect on hover */}
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                    </div>

                                    {/* Content */}
                                    <div className="relative flex flex-col h-full w-full justify-between">
                                        {/* Icon Container */}
                                        <div className={`w-20 h-20 ${value.iconBg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 shadow-lg`}>
                                            <Icon className="w-10 h-10 text-primary group-hover:scale-110 transition-transform duration-700" />
                                        </div>

                                        {/* Title */}
                                        <h3 className="font-serif text-2xl font-semibold mb-4 text-foreground group-hover:text-primary transition-colors duration-500">
                                            {value.title}
                                        </h3>

                                        {/* Description */}
                                        <p className="text-muted-foreground leading-relaxed mb-6 font-light">
                                            {value.description}
                                        </p>

                                        {/* Decorative animated line */}
                                        <div className="relative h-1 bg-border/30 rounded-full overflow-hidden">
                                            <div className="absolute inset-0 bg-gradient-to-r from-primary/50 via-primary to-primary/50 rounded-full w-12 group-hover:w-full transition-all duration-700"></div>
                                        </div>
                                    </div>
                                </div>
                            </ScrollAnimation>
                        )
                    })}
                </div>

                {/* Enhanced CTA Section with Logo Background */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border border-primary/20 shadow-2xl">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 bg-[url('/hero-beauty.webp')] bg-cover bg-center opacity-10 dark:opacity-5"></div>

                    {/* Logo Background - Integrated as Watermark */}
                    <div className="absolute inset-0 mr-20 flex items-center justify-end">
                        <Image
                            src={theme === "light" ? "/logo-light.webp" : "/logo-white.webp"}
                            alt="Youme Beauty Logo Background"
                            width={1000}
                            height={800}
                            className="opacity-[0.08] dark:opacity-[0.05] pointer-events-none"
                        />
                    </div>

                    {/* Animated gradient orbs */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                    <div className="relative z-10 p-12 md:p-16 lg:p-20">
                        <div className="max-w-2xl space-y-8">
                            <div className="space-y-6">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 rounded-full">
                                    <Sparkles className="w-4 h-4 text-primary" />
                                    <span className="text-xs font-medium tracking-widest text-primary uppercase">
                                        Sélection Exclusive
                                    </span>
                                </div>

                                <h3 className="font-serif text-4xl md:text-5xl lg:text-6xl font-medium leading-tight text-foreground">
                                    Trouvez Vos{" "}
                                    <span className="block mt-2 italic bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                                        Produits Préférés
                                    </span>
                                </h3>

                                <p className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed font-light">
                                    Une sélection rigoureuse des meilleures marques internationales pour sublimer votre beauté naturelle et révéler votre éclat.
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link
                                    href="/shop"
                                    className="group inline-flex items-center justify-center rounded-md gap-3 px-8 py-4 bg-primary text-white text-sm uppercase tracking-widest hover:bg-primary/90 hover:gap-4 transition-all duration-300 shadow-lg hover:shadow-xl"
                                >
                                    Découvrir la Boutique
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                                </Link>
                                <Link
                                    href="/skin-analyzer"
                                    className="group inline-flex items-center justify-center rounded-md gap-3 px-8 py-4 border-2 border-primary/30 bg-background/50 backdrop-blur-sm text-foreground text-sm uppercase tracking-widest hover:bg-primary/10 hover:border-primary hover:gap-4 transition-all duration-300"
                                >
                                    Analyser Ma Peau
                                    <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
                                </Link>
                            </div>
                        </div >
                    </div >
                </div >
            </div >
        </section >
    )
}
