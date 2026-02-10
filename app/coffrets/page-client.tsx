"use client"
import { getCoffrets } from "@/lib/services/coffret-service"
import { getProducts } from "@/lib/services/product-service"
import type { Coffret, Product } from "@/lib/models/models"
import { CoffretCard } from "@/components/coffret/coffret-card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {  AlertCircle, Gift } from "lucide-react"
import { useFeteTheme } from "@/components/providers/fete-theme-provider"
import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { LoadingAnimation } from "@/components/ui/loading-animation"
import { ScrollAnimation } from "@/components/navigation/scroll-animation"
import { Breadcrumb } from "@/components/navigation/breadcrumb"
import NotFound from "../not-found"

// Creative scattered layout - like photos pinned on a mood board
function generateCreativeLayout(count: number) {
  const layouts: Array<{ 
     rotation: number;
    offsetY: number;
    aspectRatio: 'portrait' | 'square';
  }> = []
  
  for (let i = 0; i < count; i++) {
    // Create organic size distribution
    const rand = Math.random()
 
    
    // Dramatic rotations for visual interest
    const rotation = -8 + Math.random() * 16
    
    // Vertical offset for staggered effect
    const offsetY = Math.random() * 40 - 20
    
    // Mix aspect ratios
    const aspectRatio = Math.random() > 0.3 ? 'portrait' : 'square'
    
    layouts.push({ rotation, offsetY, aspectRatio })
  }
  
  return layouts
}

export default function CoffretPage() {
  const { themeKey, theme } = useFeteTheme();
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlTheme = searchParams.get("theme");
  const urlView = searchParams.get("view");

  const [coffrets, setCoffrets] = useState<Coffret[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showUniversalOnly, setShowUniversalOnly] = useState(urlView === "universal");
  
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

  // Update URL when theme changes from provider (only if URL theme is not set)
  useEffect(() => {
    if (!urlTheme && themeKey !== "none") {
      const params = new URLSearchParams(searchParams.toString());
      params.set("theme", themeKey);
      router.replace(`/coffrets?${params.toString()}`, { scroll: false });
    }
  }, [themeKey, urlTheme, searchParams, router]);

  // Sync showUniversalOnly state with URL param (for browser back/forward navigation)
  useEffect(() => {
    setShowUniversalOnly(urlView === "universal");
  }, [urlView]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingAnimation />
      </div>
    )
  }
  
  const productMap = new Map(products.map((p) => [p.id, p]));
  
  // Determine active theme: use URL theme if provided, otherwise use provider theme
  const activeTheme = urlTheme || themeKey;
  
  // Separate coffrets: theme-specific and universal (none)
  const themeCoffrets = coffrets.filter(coffret => coffret.theme === activeTheme);
  const universalCoffrets = coffrets.filter(coffret => coffret.theme === "none");
  
  // Filter coffrets based on view mode
  // If showUniversalOnly is true: show only universal coffrets
  // Otherwise: show theme-specific coffrets + universal coffrets
  // Never show all coffrets mixed when a specific theme is active (theme !== "none")
  const filteredCoffrets = showUniversalOnly 
    ? universalCoffrets
    : activeTheme !== "none" 
      ? [...themeCoffrets]
      : [...universalCoffrets]; // If no specific theme, show all coffrets
  
  const creativeLayout = generateCreativeLayout(filteredCoffrets.length);
  
  if(!error && filteredCoffrets.length === 0) {
    return NotFound()
  }
          
  return (
    <>
      {activeTheme !== "none" && (
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

    <div className="min-h-screen bg-background pb-20 overflow-x-hidden">
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

          {activeTheme !== "none"  ? (
          <div className="max-w-7xl mx-auto ">
            <div className="space-y-8 flex flex-col items-center justify-center">
              <ScrollAnimation
                variant="scaleUp"
                delay={0.08}
                className="inline-flex items-center justify-center gap-2 mb-8 bg-primary/10 hover:bg-primary/15 px-5 py-2 rounded-full border border-primary/20 backdrop-blur-sm transition-all duration-300 cursor-default group"
              >
                <Gift className="w-4 h-4 text-primary transition-transform duration-300 group-hover:rotate-12" />
                <span className="text-sm font-semibold uppercase tracking-widest text-primary">
                  {theme.displayName }
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

      {/* Toggle button for universal coffrets */}
      {activeTheme !== "none" && universalCoffrets.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 mb-8 flex justify-center">
          <button
            onClick={() => {
              const newShowUniversal = !showUniversalOnly;
              setShowUniversalOnly(newShowUniversal);
              
              // Update URL for SEO
              const params = new URLSearchParams(searchParams.toString());
              if (newShowUniversal) {
                params.set("view", "universal");
              } else {
                params.delete("view");
              }
              if (activeTheme !== "none" && !urlTheme) {
                params.set("theme", activeTheme);
              }
              router.replace(`/coffrets?${params.toString()}`, { scroll: false });
            }}
            className="px-6 py-2 rounded-full border border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary font-medium transition-all duration-300"
          >
            {showUniversalOnly ? "Voir les coffrets " + theme.displayName : "Voir les autres coffrets"}
          </button>
        </div>
      )}
      
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
      {!error && filteredCoffrets.length > 0 && (
        <div className="max-w-7xl mx-auto px-4">
          {/* Staggered grid with varying sizes - like a creative mood board */}
          <div className="grid grid-cols-12 gap-4 md:gap-6  ">
            {filteredCoffrets.map((coffret: Coffret, index) => {
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

              const gridClass = sizeMap['md'] // Using 'md' size for balanced layout
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