
import Link from "next/link"
import Image from "next/image"
import { ScrollAnimation } from "./scroll-animation"
import { useLoading } from "./loading-provider"
import {  usePathname } from "next/navigation"

const categories = [
  {
    id: "soins",
    name: "Soins",
    image: "/categories/skincare.webp",
    href: "/shop?category=soins",
  },
  {
    id: "maquillage",
    name: "Maquillage",
    image: "/categories/makeup.webp",
    href: "/shop?category=maquillage",
  },
  {
    id: "parfum",
    name: "Parfum",
    image: "/categories/perfume.webp",
    href: "/shop?category=parfum",
  },
  {
    id: "outils",
    name: "Outils de Beauté",
    image: "/categories/tools.webp",
    href: "/shop?category=outils",
  },
]

export function Categories() {
  const pathname = usePathname()
  const { setIsLoading: setGlobalLoading } = useLoading()
  
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    // Only show loading if navigating to a different page
    if (pathname !== href) {
      setGlobalLoading(true)
    }
  }
     return (
            <section className="relative mt-10 overflow-hidden">

      <div className="container mx-auto px-4  z-10">
        <div className="mb-16 flex items-end justify-between ">
          <div className="max-w-xl">

            <div className="inline-flex items-center gap-2">
              <span className="h-px w-8 bg-primary"></span>
              <span className="text-sm font-medium tracking-widest uppercase text-primary">Explorer</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-foreground">
              Nos Catégories
            </h1>
          </div>
          <span className="text-muted-foreground hidden md:block text-xs tracking-widest uppercase border-l border-border pl-4 ml-4">01 / DISCOVER</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((category, index) => (
            <ScrollAnimation
              key={category.id}
              variant="scaleUp"
              delay={index * 0.15}
            >
              <Link
                href={category.href}
                className="rounded-xl group relative aspect-[3/4] overflow-hidden bg-secondary block"
                onClick={(e) => handleNavClick(e, "/")}
              >
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500" />

                <div className="absolute inset-0 p-8 flex flex-col justify-end">
                  <div>
                    <h3 className="font-serif text-3xl text-white mb-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      {category.name}
                    </h3>
                    <div className="w-full h-px bg-white/50 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                  </div>
                </div>
              </Link>
            </ScrollAnimation>
          ))}
        </div>
      </div>
    </section>
  )
}
