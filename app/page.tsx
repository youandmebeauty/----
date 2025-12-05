import { Hero } from "@/components/hero"
import { FeaturedProducts } from "@/components/featured-products"
import { Categories } from "@/components/categories"
import { WhyChooseUs } from "@/components/why-choose-us"
import { MakeupModel3D } from "@/components/makeup-model"

import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Accueil",
  description: "Bienvenue chez You & Me Beauty. Découvrez notre gamme exclusive de produits de beauté, soins du visage et maquillage pour sublimer votre beauté naturelle.",
}

export default function Home() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <main>
        <Hero />
        <div className="hidden lg:block absolute top-10 right-0 w-1/2 h-[100vh] z-20" >
          <MakeupModel3D />
        </div>
        <Categories />
        <FeaturedProducts />
        <WhyChooseUs />
      </main>
    </div>
  )
}
