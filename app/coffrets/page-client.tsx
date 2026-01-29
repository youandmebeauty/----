"use client"
import { getCoffrets } from "@/lib/services/coffret-service"
import { getProducts } from "@/lib/services/product-service"
import type { Coffret, Product } from "@/lib/models/models"
import { CoffretCard } from "@/components/coffret/coffret-card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {  AlertCircle, Gift } from "lucide-react"
import Link from "next/link"
import "./coffret-hearts.css"
import { useSaintValentin } from "@/components/coffret/saint-valentin-provider"
import { useEffect, useState } from "react"
import { LoadingAnimation } from "@/components/ui/loading-animation"
import { ScrollAnimation } from "@/components/navigation/scroll-animation"
import { Breadcrumb } from "@/components/navigation/breadcrumb"
import NotFound from "../not-found"

// Creative scattered layout - like photos pinned on a mood board
function generateCreativeLayout(count: number) {
  const layouts: Array<{ 
    size: 'sm' | 'md' | 'lg';
    rotation: number;
    offsetY: number;
    aspectRatio: 'portrait' | 'square';
  }> = []
  
  for (let i = 0; i < count; i++) {
    // Create organic size distribution
    let size: 'sm' | 'md' | 'lg'
    const rand = Math.random()
    
    if (i % 5 === 0) {
      size = 'lg' // Every 5th is large (hero)
    } else if (rand > 0.7) {
      size = 'md'
    } else {
      size = 'sm'
    }
    
    // Dramatic rotations for visual interest
    const rotation = -8 + Math.random() * 16
    
    // Vertical offset for staggered effect
    const offsetY = Math.random() * 40 - 20
    
    // Mix aspect ratios
    const aspectRatio = Math.random() > 0.3 ? 'portrait' : 'square'
    
    layouts.push({ size, rotation, offsetY, aspectRatio })
  }
  
  return layouts
}

export default function CoffretPage() {
  const { saintValentin } = useSaintValentin();

  const [coffrets, setCoffrets] = useState<Coffret[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const results = await Promise.allSettled([getCoffrets(), getProducts()]);

        if (results[0].status === "fulfilled") {
          setCoffrets(results[0].value);
        } else {
          setError("Impossible de charger les coffrets");
          console.error("Failed to fetch coffrets:", results[0].reason);
        }

        if (results[1].status === "fulfilled") {
          setProducts(results[1].value);
        }
      } catch (err) {
        setError("Une erreur est survenue");
        console.error(err);
      }
      setLoading(false);
    }
    fetchData();
  }, []);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingAnimation />
      </div>
    )
  }
  
  const productMap = new Map(products.map((p) => [p.id, p]));
  const creativeLayout = generateCreativeLayout(coffrets.length);
  
  if(!error && coffrets.length === 0) {
    return NotFound()
  }
          
  return (
    <>
      {saintValentin && (
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {[...Array(8)].map((_, i) => {
          const colors = ['#FF0055', '#0066FF', '#FFCC00', '#00D9FF', '#FF00CC', '#7B61FF', '#FF6B00', '#00FF88']
          const sizes = [60, 45, 50, 55, 40, 30, 35, 38]
          const heartPositions = [
            { left: '10%', top: '15%' },
            { right: '15%', top: '25%' },
            { left: '80%', top: '60%' },
            { left: '5%', top: '70%' },
            { right: '20%', top: '75%' },
            { left: '25%', top: '35%' },
            { right: '35%', top: '45%' },
            { left: '60%', top: '20%' }
          ]
          
          return (
            <div 
              key={i}
              className={`coffret-heart coffret-heart-${i + 1}`}
              style={heartPositions[i]}
            >
              <svg width={sizes[i]} height={sizes[i]} viewBox="0 0 24 24" fill="none">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill={colors[i]}/>
              </svg>
            </div>
          )
        })}
      </div>)
 }
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="relative border border-border/50 bg-gradient-to-br from-secondary/30 via-secondary/20 to-background rounded-3xl m-4 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
        <ScrollAnimation
          variant="blurRise"
          duration={0.9}
          ease="power4.out"
          className="container relative mx-auto px-4 py-20 lg:py-28"
        >
          <div className="max-w-4xl mx-auto text-center">
            <ScrollAnimation
              variant="flipUp"
              perspective={1400}
              ease="expo.out"
              className="flex justify-start mb-8"
            >
              <Breadcrumb
                items={[{ name: "Coffrets", href: "/coffrets", current: true }]}
              />
            </ScrollAnimation>

          {saintValentin ? (
          <div className="max-w-7xl mx-auto ">
            <div className="space-y-8 flex flex-col items-center justify-center">
              <ScrollAnimation
                variant="scaleUp"
                delay={0.08}
                className="inline-flex items-center justify-center gap-2 mb-8 bg-primary/10 hover:bg-primary/15 px-5 py-2 rounded-full border border-primary/20 backdrop-blur-sm transition-all duration-300 cursor-default group"
              >
                <Gift className="w-4 h-4 text-primary transition-transform duration-300 group-hover:rotate-12" />
                <span className="text-sm font-semibold uppercase tracking-widest text-primary">
                  Saint-Valentin 2026
                </span>
              </ScrollAnimation>
              
              <ScrollAnimation
                variant="blurRise"
                delay={0.1}
                className="mb-8"
              >
                <h1 className="font-serif text-4xl font-medium tracking-tight text-transparent md:text-6xl lg:text-7xl bg-gradient-to-br from-foreground via-foreground to-foreground/70 bg-clip-text">
                  Nos Coffrets Cadeaux
                </h1>
              </ScrollAnimation>
              <p className="text-lg md:text-xl font-medium leading-relaxed w-full">
                Des ensembles soigneusement sélectionnés pour offrir ou se faire plaisir.
              </p>
            </div>
          </div> ): (
          <div className="max-w-7xl mx-auto ">
            <div className="space-y-4 flex flex-col items-center justify-center">
              <ScrollAnimation
                variant="scaleUp"
                delay={0.08}
                className="inline-flex items-center justify-center gap-2 mb-8 bg-primary/10 hover:bg-primary/15 px-5 py-2 rounded-full border border-primary/20 backdrop-blur-sm transition-all duration-300 cursor-default group"
              >
                <Gift className="w-4 h-4 text-primary transition-transform duration-300 group-hover:rotate-12" />
                <span className="text-sm font-semibold uppercase tracking-widest text-primary">
                  Offre Spéciale
                </span>
              </ScrollAnimation>
              <ScrollAnimation
                variant="blurRise"
                delay={0.1}
                className="mb-8"
              >
                <h1 className="font-serif text-4xl font-medium tracking-tight text-transparent md:text-6xl lg:text-7xl bg-gradient-to-br from-foreground via-foreground to-foreground/70 bg-clip-text">
                  Nos Packs Exclusifs
                </h1>
              </ScrollAnimation>
              <p className="text-lg md:text-xl font-medium leading-relaxed w-full">
                Découvrez notre collection de packs spéciaux soigneusement sélectionnés.
              </p>
            </div>
          </div>)
          } 
          </div>
        </ScrollAnimation>
      </div>
      
      {/* Error State */}
      {error && (
        <div className="max-w-xl mx-auto px-4 mb-8">
          <Alert variant="destructive">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription className="font-medium">
              {error}. Veuillez réessayer plus tard.
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Coffrets - Creative Scattered Polaroid Layout */}
      {!error && coffrets.length > 0 && (
        <div className="max-w-7xl mx-auto px-4">
          {/* Staggered grid with varying sizes - like a creative mood board */}
          <div className="grid grid-cols-12 gap-4 md:gap-6  ">
            {coffrets.map((coffret: Coffret, index) => {
              const productNames = coffret.productIds
                ?.map(id => productMap.get(id)?.name)
                .filter((name): name is string => !!name) || []

              const layout = creativeLayout[index]
              
              // Map sizes to grid spans and row spans
              const sizeMap = {
                sm: { 
                  colSpan: 'col-span-12 sm:col-span-6 lg:col-span-4',
                  rowSpan: 'row-span-3'
                },
                md: { 
                  colSpan: 'col-span-12 sm:col-span-6 lg:col-span-4',
                  rowSpan: 'row-span-4'
                },
                lg: { 
                  colSpan: 'col-span-12 sm:col-span-12 lg:col-span-8',
                  rowSpan: 'row-span-5'
                }
              }

              const gridClass = sizeMap[layout.size]

              return (
                <div 
                  key={coffret.id}
                  className={`
                    group/item
                    ${gridClass.colSpan}
                    ${gridClass.rowSpan}
                    transition-all 
                    duration-700
                    ease-out
                    hover:scale-105
                    hover:z-20
                   `}
                  style={{
                    transform: `rotate(${layout.rotation}deg) translateY(${layout.offsetY}px)`,
                    transformOrigin: 'center center',
                  }}
                >
                  {/* Polaroid-style wrapper */}
                  <div 
                    className="
                      scale-90

                      rounded-sm
                    "
                  >
                    {/* Inner content */}
                    <div className="h-full w-full relative">
                      <CoffretCard
                        coffret={coffret}
                        productNames={productNames}
                         priority={index < 4}
                      />
                    </div>
                    
                    {/* Tape effect on hover */}
                    <div 
                      className="
                        absolute 
                        top-0

                        left-1/2
                        -translate-x-1/2
                        -translate-y-1/2
                        w-20 
                        h-6 
                        bg-yellow-100/50
                        dark:bg-yellow-900/20
                          transition-opacity
                        duration-300
                      "
 
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
    </>
  )
}