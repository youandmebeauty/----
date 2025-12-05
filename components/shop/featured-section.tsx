"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"

const CATEGORY_VIDEOS: Record<string, string> = {
    maquillage: "/boutique/maquillage.mp4",
    soins: "/boutique/soins.mp4",
    visage: "/boutique/soins.mp4",
    corps: "/boutique/soins.mp4",
    cheveux: "/boutique/soins.mp4",
    parfum: "/boutique/parfum.mp4",
    outils: "/boutique/outils.mp4",
}

const CATEGORY_CONTENT: Record<string, { title: string; subtitle: string; description: string }> = {
    maquillage: {
        subtitle: "Art & Couleur",
        title: "Révélez Votre Éclat",
        description: "Exprimez votre style unique avec notre collection de maquillage haute performance."
    },
    soins: {
        subtitle: "Rituel de Soin",
        title: "Peau Saine & Rayonnante",
        description: "Des formules expertes pour nourrir, protéger et sublimer votre peau jour après jour."
    },
    visage: {
        subtitle: "Soin du Visage",
        title: "L'Excellence Dermatologique",
        description: "Solutions ciblées pour un teint parfait et une peau visiblement plus jeune."
    },
    corps: {
        subtitle: "Soin du Corps",
        title: "Bien-être Absolu",
        description: "Transformez votre routine en moment de spa avec nos soins corporels luxueux."
    },
    cheveux: {
        subtitle: "Soin Capillaire",
        title: "Chevelure de Rêve",
        description: "Redonnez force, brillance et vitalité à vos cheveux avec nos soins professionnels."
    },
    parfum: {
        subtitle: "Fragrances",
        title: "Signature Olfactive",
        description: "Laissez une empreinte inoubliable avec nos parfums d'exception."
    },
    outils: {
        subtitle: "Accessoires Pro",
        title: "L'Art du Détail",
        description: "Les outils indispensables pour une application parfaite et des résultats professionnels."
    },
    default: {
        subtitle: "Sélection Exclusive",
        title: "L'Essence de la Beauté",
        description: "Découvrez nos dernières innovations pour une beauté naturelle et sophistiquée."
    }
}

const ALL_VIDEOS = [
    "/boutique/maquillage.mp4",
    "/boutique/soins.mp4",
    "/boutique/parfum.mp4",
    "/boutique/outils.mp4",
]

export function FeaturedSection() {
    const searchParams = useSearchParams()
    const category = searchParams.get("category")
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
    const [isSlideshow, setIsSlideshow] = useState(true)

    useEffect(() => {
        if (!category || category === "all") {
            setIsSlideshow(true)
            const interval = setInterval(() => {
                setCurrentVideoIndex((prev) => (prev + 1) % ALL_VIDEOS.length)
            }, 2000) // Change video every 2 seconds

            return () => clearInterval(interval)
        } else {
            setIsSlideshow(false)
        }
    }, [category])

    const getVideoSrc = () => {
        if (isSlideshow) {
            return ALL_VIDEOS[currentVideoIndex]
        }
        if (category && CATEGORY_VIDEOS[category]) {
            return CATEGORY_VIDEOS[category]
        }
        return ALL_VIDEOS[0] // Fallback
    }

    const getContent = () => {
        if (category && CATEGORY_CONTENT[category]) {
            return CATEGORY_CONTENT[category]
        }
        return CATEGORY_CONTENT.default
    }

    const content = getContent()

    const handleDiscoverClick = () => {
        const productSection = document.getElementById('product-section')
        if (productSection) {
            productSection.scrollIntoView({ behavior: 'smooth' })
        }
    }

    return (
        <section className="relative w-full h-[400px] lg:h-[500px] mb-16 overflow-hidden rounded-2xl">
            <div className="absolute inset-0 bg-black">
                <AnimatePresence mode="wait">
                    <motion.video
                        key={getVideoSrc()}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        src={getVideoSrc()}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                </AnimatePresence>
                <div className="absolute inset-0 bg-black/40" />
            </div>

            <div className="relative h-full flex flex-col justify-center items-center text-center text-white px-4">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={category || "default"}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.6 }}
                        className="space-y-6"
                    >
                        <span className="text-sm font-medium tracking-[0.2em] uppercase">{content.subtitle}</span>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-light">{content.title}</h2>
                        <p className="max-w-lg mx-auto text-lg text-white/90 font-light">
                            {content.description}
                        </p>
                        <Button
                            onClick={handleDiscoverClick}
                            variant="outline"
                            className="bg-white/10 backdrop-blur-md border-white text-white hover:bg-white hover:text-black transition-all duration-300 rounded-full px-8"
                        >
                            Découvrir
                        </Button>
                    </motion.div>
                </AnimatePresence>
            </div>
        </section>
    )
}
