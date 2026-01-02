
import Link from "next/link"
import Image from "next/image"
import { ScrollAnimation } from "./scroll-animation"


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
     return (
            <div className="relative mt-10 overflow-hidden">

      <div className="container mx-auto px-4  z-10">
        <div className="mb-16 flex items-end justify-between ">
          <div className="max-w-2xl">

            <div className="inline-flex items-center gap-2">
              <span className="h-px w-8 bg-primary"></span>
              <span className="text-sm font-medium tracking-widest uppercase text-primary">Explorer</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-foreground">
              Nos Catégories
            </h1>
            
            <p className="mt-4 text-xs md:text-sm text-muted-foreground leading-relaxed">
              Explorez notre <Link href="/shop" className="text-foreground hover:underline font-medium">boutique cosmétique en ligne</Link> et découvrez nos catégories de produits : <Link href="/shop?category=maquillage" className="text-foreground hover:underline">maquillage professionnel</Link>, <Link href="/shop?category=soins" className="text-foreground hover:underline">soins du visage et du corps</Link>, <Link href="/shop?category=parfum" className="text-foreground hover:underline">parfums originaux</Link>, et <Link href="/shop?category=outils" className="text-foreground hover:underline">accessoires beauté</Link>.
            </p>
          </div>
          <span className="text-muted-foreground hidden md:block text-xs tracking-widest uppercase border-l border-border pl-4 ml-4">01 / DISCOVER</span>
        </div>

        <ScrollAnimation
          variant="slideUp"
          perspective={1400}
          ease="expo.out"
          delay={0}

          duration={0.2}
          stagger={0.18}
          childSelector=".category-card"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={category.href}
                className="category-card group relative block aspect-[3/4] overflow-hidden rounded-xl bg-secondary"
              >
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/20 transition-colors duration-500 group-hover:bg-black/40" />

                <div className="absolute inset-0 flex flex-col justify-end p-8">
                  <div>
                    <h3 className="font-serif text-3xl text-white mb-2 transform translate-y-4 transition-transform duration-500 group-hover:translate-y-0">
                      {category.name}
                    </h3>
                    <div className="h-px w-full origin-left scale-x-0 bg-white/50 transition-transform duration-500 group-hover:scale-x-100"></div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </ScrollAnimation>
      </div>
    </div>
  )
}
