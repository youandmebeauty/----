"use client"

import { ScrollAnimation } from "./scroll-animation";
const categories = [
  {
    id: "soins",
    name: "Soins",
    image: "/categories/skincare.webp",
    href: "/shop?category=soins",
    rotation: -2,
  },
  {
    id: "maquillage",
    name: "Maquillage",
    image: "/categories/makeup.webp",
    href: "/shop?category=maquillage",
    rotation: 3,
  },
  {
    id: "parfum",
    name: "Parfum",
    image: "/categories/perfume.webp",
    href: "/shop?category=parfum",
    rotation: -3,
  },
  {
    id: "outils",
    name: "Outils de Beauté",
    image: "/categories/tools.webp",
    href: "/shop?category=outils",
    rotation: 2,
  },
];


export  function Categories() {
  return (
    <div className="relative overflow-hidden  bg-background">
     
      <div className="container mx-auto px-4 relative z-10">
        <ScrollAnimation
          variant="blurRise"
          duration={1.2}
          stagger={0.5}
          delay={0.5}
         className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 mb-4">
                            <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary"></div>
            <span className="text-xs font-medium tracking-[0.3em] uppercase text-primary">Explorer</span>
            <div className="h-px w-12 bg-gradient-to-r from-primary to-transparent"></div>
          </div>

          <h1 className="text-5xl md:text-6xl font-light tracking-tight leading-none ">
            Nos Catégories
          </h1>
        </ScrollAnimation>

        <ScrollAnimation
          variant="blurRise"
          stagger={0.2}
          childSelector=".category-card"
          duration={0.7}
          delay={0.2}
          ease="expo"
          className="grid grid-cols-1 -my-24 md:my-16 gap-8 md:grid-cols-2 lg:grid-cols-4 scale-90 md:scale-100  mx-auto"
        >
          {categories.map((category) => (
            <a
              key={category.id}
              href={category.href}
              className="category-card group relative block "
              style={{
                transform: `rotate(${category.rotation}deg)`,
                transition: 'transform 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = `rotate(0deg) scale(1.05)`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = `rotate(${category.rotation}deg) scale(1)`;
              }}
            >
              {/* Polaroid frame */}
              <div className="bg-white p-4 pb-16 shadow-xl rounded-sm">
                {/* Photo */}
                <div className="relative aspect-[4/5] overflow-hidden bg-gray-200 mb-4">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                  />
                  
                  {/* Subtle overlay */}
                  <div className="absolute inset-0 bg-black/5" />
                </div>

                {/* Label */}
                <div className="text-center">
                  <h3 className="text-2xl md:text-3xl text-black/90 tracking-tight">
                    {category.name}
                  </h3>
                </div>

                {/* Tape effect */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-6 bg-white/40 backdrop-blur-sm border-l border-r border-black/10 shadow-sm transform rotate-1" />
              </div>

              {/* Shadow */}
              <div 
                className="absolute inset-0 bg-black/10 blur-xl -z-10 opacity-50 transition-opacity duration-300 group-hover:opacity-70"
                style={{
                  transform: `translate(${Math.random() * 10 - 5}px, ${Math.random() * 10 + 5}px)`,
                }}
              />
            </a>
          ))}
        </ScrollAnimation>


      </div>
    </div>
  );
}