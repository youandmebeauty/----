"use client"

import { useEffect, useState } from "react"
import { Coffret, Product } from "@/lib/models/models"
import { getCoffrets } from "@/lib/services/coffret-service"
import { getProducts } from "@/lib/services/product-service"
import { CoffretCard } from "./coffret-card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { AlertCircle, ArrowRight, Dice1, Gift, RefreshCw } from "lucide-react"
import { useFeteTheme } from "../providers/fete-theme-provider"
import { ScrollAnimation } from "../navigation/scroll-animation"
interface CoffretSectionProps {
    limit?: number
    title?: string
    description?: string
    showViewAll?: boolean
}

export function CoffretSection({
    limit = 3,
    showViewAll = true,
}: CoffretSectionProps) {
    const { themeKey, theme } = useFeteTheme();

    const [coffrets, setCoffrets] = useState<Coffret[]>([])
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const loadData = async () => {
        setLoading(true)
        setError(null)
        
        try {
            const [coffretsData, productsData] = await Promise.all([
                getCoffrets(),
                getProducts()
            ])
            setCoffrets(coffretsData)
            setProducts(productsData)
        } catch (err) {
            console.error("Failed to load coffrets", err)
            setError("Une erreur est survenue lors du chargement des coffrets.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadData()
    }, [])

    if (error) {
        return (
            <section className="py-20">
                <div className="container px-4">
                    <Alert variant="destructive" className="max-w-2xl mx-auto border-2 border-black bg-white">
                        <AlertCircle className="h-5 w-5" />
                        <AlertDescription className="flex items-center justify-between">
                            <span className="font-bold">{error}</span>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={loadData}
                                className="ml-4 border-2 border-black font-bold"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                RÉESSAYER
                            </Button>
                        </AlertDescription>
                    </Alert>
                </div>
            </section>
        )
    }

    if ((loading && coffrets.length === 0) || coffrets.length === 0) {
        return (
      <div className="py-16 mt-24 bg-background rounded-3xl m-4">
        <div className="container mx-auto px-4">

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/5] bg-secondary/20 mb-4" />
                <div className="h-4 bg-secondary/20 w-3/4 mb-2" />
                <div className="h-4 bg-secondary/20 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
    }

    const productMap = new Map(products.map(p => [p.id, p]))
    const coffretWithTheme = coffrets.map(c => ({ ...c, theme: c.theme || "none" }))
    coffretWithTheme.sort((a, b) => {
        if (a.theme === themeKey && b.theme !== themeKey) return -1
        if (a.theme !== themeKey && b.theme === themeKey) return 1
        return 0
    });
    const displayedCoffrets = coffretWithTheme.slice(0, limit).reverse()

        return (
        <div className="py-10 mt-10 bg-background border border-border/50 rounded-3xl m-4 z-0 shadow-inner relative">
            
                        {themeKey !== "none" && (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
       {[...Array(30)].map((_, i) => {
  const size = Math.floor(Math.random() * 60) + 20;
  const palette = [theme.colors.primary, theme.colors.secondary || theme.colors.primary];
  const color = palette[Math.floor(Math.random() * palette.length)];
  const left = Math.floor(Math.random() * 90) + 5;
  const top = Math.floor(Math.random() * 90) + 5;
  const duration = Math.floor(Math.random() * 6) + 5;
  const delay = Math.floor(Math.random() * 5);
  const Icon = (theme.icons && theme.icons.length > 0) ? theme.icons[i % theme.icons.length] : Gift;

  return (
    <div
      key={i}
      className="coffret-heart"
      style={{
        left: `${left}%`,
        top: `${top}%`,
        animation: `coffret-float ${duration}s ease-in-out infinite ${delay}s`,
      }}
    >
      <Icon size={size} color={color} aria-hidden="true" />
    </div>
  );
})}
    </div>
)}


           <div className="container mx-auto px-4 ">

                        {/* Title Column */}
                                {themeKey !== "none" ? 
                                (
                                
                            <ScrollAnimation
                                          variant="slideUp"
                                          duration={0.7}
                                          stagger={0.2}
                                          delay={0.2}
                                         className="mb-10 text-center"> 
                                          <div className="inline-flex items-center gap-2 mb-4">
                                                            <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary"></div>
                                                                                        <span className="text-xs font-medium tracking-[0.3em] uppercase text-primary">{theme.displayName}</span>
                                            <div className="h-px w-12 bg-gradient-to-r from-primary to-transparent"></div>
                                          </div>
                                
                                     <h1 className="text-4xl md:text-6xl font-light tracking-tight leading-none ">
                                    Nos Coffrets Cadeaux                           
                                                
                                </h1>  
                                {showViewAll && (
                                                    <Button 
                                        size="sm" 
                                        className="w-full hidden lg:inline-flex sm:w-auto group bg-primary mt-4 hover:bg-primary/90 text-primary-foreground h-12 sm:h-13 px-8 rounded-full text-base font-medium transition-all duration-300 ease-out hover:scale-105"
                                    >
                                                        <Link href="/coffrets" className="flex items-center justify-center ">
                                                            Voir tout
                                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                                            </Link>
                                                    </Button>
                                                )}
                                        </ScrollAnimation>
                                    ) : 
                                (
                                        <ScrollAnimation
                                          variant="slideUp"
                                          duration={0.7}
                                          stagger={0.2}
                                          delay={0.2}
                                         className="mb-10 text-center"> 
                                          <div className="inline-flex items-center gap-2 mb-4">
                                                            <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary"></div>
                                            <span className="text-xs font-medium tracking-[0.3em] uppercase text-primary">Offre Spéciale </span>
                                            <div className="h-px w-12 bg-gradient-to-r from-primary to-transparent"></div>
                                          </div>
                                
                                     <h1 className="text-4xl md:text-6xl font-light tracking-tight leading-none ">
                                    Nos Packs Exclusifs                           
                                                
                                </h1>  
                                {showViewAll && (
                                                    <Button 
                                        size="sm" 
                                        className="w-full hidden lg:inline-flex sm:w-auto group bg-primary mt-4 hover:bg-primary/90 text-primary-foreground h-12  px-8 rounded-full text-base font-medium transition-all duration-300 ease-out hover:scale-105"
                                    >
                                                        <Link href="/coffrets" className="flex items-center justify-center ">
                                                            Voir tout
                                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                                            </Link>
                                                    </Button>
                                                )}
                                        </ScrollAnimation>)}
          

                {/* Grid - Clean Swiss Layout */}
                    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 container p-4 gap-8">
                        {displayedCoffrets.map((coffret, index) => {
                            const productNames = coffret.productIds
                                ?.map(id => productMap.get(id)?.name)
                                .filter((name): name is string => !!name) || []

                            return (
                                <div 
                                    key={coffret.id}
                                    className="group transition-transform duration-300 hover:-translate-y-2"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                > 
                                    <CoffretCard
                                        coffret={coffret}
                                        productNames={productNames}
                                        aspectRatio="portrait"
                                        priority={index === 0}
                                    />
                                </div>
                            )
                        })}
                    </div>

                {/* Mobile CTA */}
                {showViewAll && (
                    <div className="mt-4 md:mt-16 lg:hidden text-center">
                        <Button 
                            asChild 
                            className=" max-w-xs md:max-w-md bg-primary rounded-full hover:bg-primary/90 text-white font-bold px-8 py-6  uppercase tracking-wider border-0"
                        >
                            <Link href="/coffrets">
                                Voir tous les coffrets →
                            </Link>
                        </Button>
                    </div>
                )}
              </div>
            
            <style jsx>{`
                @keyframes float {
                    0%, 100% {
                        transform: translateY(0) rotate(0deg);
                    }
                    33% {
                        transform: translateY(-30px) rotate(5deg);
                    }
                    66% {
                        transform: translateY(-15px) rotate(-5deg);
                    }
                }

                @keyframes float-reverse {
                    0%, 100% {
                        transform: translateY(0) rotate(0deg);
                    }
                    33% {
                        transform: translateY(-25px) rotate(-5deg);
                    }
                    66% {
                        transform: translateY(-12px) rotate(5deg);
                    }
                }

                .heart {
                    position: absolute;
                    opacity: 0.15;
                    transition: all 0.3s ease;
                }

                .heart:hover {
                    opacity: 0.4;
                    transform: scale(1.1);
                }

                .heart-1 {
                    animation: float 8s ease-in-out infinite;
                }

                .heart-2 {
                    animation: float-reverse 10s ease-in-out infinite;
                    animation-delay: 1s;
                }

                .heart-3 {
                    animation: float 9s ease-in-out infinite;
                    animation-delay: 2s;
                }

                .heart-4 {
                    animation: float-reverse 11s ease-in-out infinite;
                    animation-delay: 0.5s;
                }

                .heart-5 {
                    animation: float 7s ease-in-out infinite;
                    animation-delay: 3s;
                }

                .heart-6 {
                    animation: float-reverse 8.5s ease-in-out infinite;
                    animation-delay: 1.5s;
                }

                .heart-7 {
                    animation: float 10.5s ease-in-out infinite;
                    animation-delay: 2.5s;
                }

                .heart-8 {
                    animation: float-reverse 9.5s ease-in-out infinite;
                    animation-delay: 0.8s;
                }
            `}</style>
        </div>)
}