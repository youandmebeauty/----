"use client"

import { Button } from "@/components/ui/button"
import { useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { gsap } from "@/lib/utils/gsap-util"

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
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const contentRef = useRef<HTMLDivElement | null>(null)
    const gsapContextRef = useRef<ReturnType<typeof gsap.context> | null>(null)

    // Determine the active video src
    const videoSrc =
        !category || category === "all"
            ? ALL_VIDEOS[currentVideoIndex]
            : CATEGORY_VIDEOS[category] ?? ALL_VIDEOS[0]

    // Determine the displayed content
    const content =
        category && CATEGORY_CONTENT[category]
            ? CATEGORY_CONTENT[category]
            : CATEGORY_CONTENT.default

    const contentKey = category || "default"

    // Slideshow interval — only when no category is selected
    useEffect(() => {
        if (!category || category === "all") {
            const interval = setInterval(() => {
                setCurrentVideoIndex((prev) => (prev + 1) % ALL_VIDEOS.length)
            }, 2000)
            return () => clearInterval(interval)
        } else {
            setCurrentVideoIndex(0) // reset index when a category is picked
        }
    }, [category])

    // Crossfade the video when src changes — NO remount
    useEffect(() => {
        const video = videoRef.current
        if (!video) return

        // Fade out
        gsap.to(video, {
            opacity: 0,
            duration: 0.3,
            ease: "power1.in",
            onComplete: () => {
                // Swap src only after fade-out finishes
                video.src = videoSrc
                video.load() // triggers the browser to start loading the new source
                video.play().catch(() => {}) // autoplay may need user gesture on some browsers

                // Fade back in
                gsap.to(video, {
                    opacity: 1,
                    duration: 0.5,
                    ease: "power1.out",
                })
            },
        })
    }, [videoSrc])

    // Animate content text when category changes
    useEffect(() => {
        const el = contentRef.current
        if (!el) return

        if (gsapContextRef.current) gsapContextRef.current.revert()

        gsapContextRef.current = gsap.context(() => {
            gsap.fromTo(
                el,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
            )
        }, el)

        return () => {
            gsapContextRef.current?.revert()
        }
    }, [contentKey])

    const handleDiscoverClick = () => {
        requestAnimationFrame(() => {
            document.getElementById("product-section")?.scrollIntoView({ behavior: "smooth" })
        })
    }

    return (
        <section className="relative w-full h-[400px] lg:h-[500px] mb-16 overflow-hidden rounded-2xl">
            <div className="absolute inset-0">
                {/* Single video element — never remounted */}
                <video
                    ref={videoRef}
                    src={videoSrc}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 h-full w-full object-cover"
                    style={{ opacity: 1 }}
                />
                <div className="absolute inset-0 bg-black/40" />
            </div>

            <div className="relative h-full flex flex-col justify-center items-center text-center text-white px-4">
                <div ref={contentRef} key={contentKey} className="space-y-6">
                    <span className="text-sm font-medium uppercase tracking-[0.2em]">{content.subtitle}</span>
                    <h2 className="text-4xl font-light md:text-5xl lg:text-6xl">{content.title}</h2>
                    <p className="mx-auto max-w-lg text-lg font-light text-white/90">
                        {content.description}
                    </p>
                    <Button
                        onClick={handleDiscoverClick}
                        variant="outline"
                        className="rounded-full bg-white/10 px-8 text-white transition-all duration-300 hover:bg-white hover:text-black backdrop-blur-md border-white"
                    >
                        Découvrir
                    </Button>
                </div>
            </div>
        </section>
    )
}