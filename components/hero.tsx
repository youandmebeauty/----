import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { ScrollAnimation } from "@/components/scroll-animation"

export function Hero() {

    return (
        <div className="relative overflow-hidden min-h-[500px] sm:min-h-[600px] lg:min-h-[650px] rounded-3xl sm:rounded-3xl  m-4  border border-border/40">
            {/* Subtle Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background rounded-3xl" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent rounded-3xl" />

            <div className="relative z-10 container mx-auto px-4 sm:px-6 py-16 sm:py-20 lg:py-24">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    {/* Left side - Text content */}
                    <div className="max-w-2xl">
                        {/* Elegant Heading */}
                        <ScrollAnimation variant="blurRise" duration={0.5} delay={0.1}>
                            <h1 className="mb-5 sm:mb-6 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
                                <div className="inline"><span className="inline-block text-foreground">Beauté</span>
                                <span className="inline-block ml-5 text-primary">Naturelle</span></div>
                                <span className="block text-foreground/80 text-3xl sm:text-4xl md:text-5xl lg:text-6xl mt-2">Élégance Intemporelle</span>
                            </h1>
                        </ScrollAnimation>

                        {/* Refined Description */}
                        <ScrollAnimation variant="blurRise" duration={0.4} delay={0.2}>
                            <p className="mb-8 sm:mb-10 text-base sm:text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-lg">
                                Une sélection exclusive de cosmétiques authentiques, alliant prestige et expertise pour révéler votre beauté unique.
                            </p>
                        </ScrollAnimation>

                        {/* Clean CTAs */}
                        <ScrollAnimation variant="glitchReveal" duration={0.7} delay={0.3} stagger={0.1} childSelector="a">
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                <Link href="/shop" className="w-full sm:w-auto">
                                    <Button 
                                        size="lg" 
                                        className="w-full sm:w-auto group bg-primary hover:bg-primary/90 text-primary-foreground h-12 sm:h-13 px-8 rounded-full text-base font-medium transition-all duration-300 ease-out hover:scale-105"
                                    >
                                        Explorer la Boutique
                                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </Button>
                                </Link>
                                <Link href="/skin-analyzer" className="w-full sm:w-auto">
                                    <Button 
                                        size="lg" 
                                        variant="ghost"
                                        className="w-full sm:w-auto group h-12 sm:h-13 px-8 rounded-full text-base font-medium hover:bg-primary/5 hover:text-primary/45 transition-all duration-300"
                                    >
                                        Diagnostic de Peau IA
                                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </Button>
                                </Link>
                            </div>
                        </ScrollAnimation>

                        {/* Trust Indicators */}
                        <ScrollAnimation variant="blurRise" duration={0.4} delay={0.2} stagger={0.2}
                             className="mt-8 sm:mt-10 flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                    <span>Livraison Rapide</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                    <span>Produits Authentiques</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                    <span>Satisfaction Garantie</span>
                                </div>
                                
                            
                        </ScrollAnimation>
                    </div>

                </div>
            </div>

            {/* Grid Background Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none rounded-3xl" />

            {/* Minimal Decorative Elements */}
            <div className="absolute top-0 right-0 h-[400px] w-[400px] rounded-full bg-primary/5 blur-[120px]" />
            <div className="absolute bottom-0 left-0 h-[300px] w-[300px] rounded-full bg-accent/5 blur-[100px]" />
        </div>

    )
}
