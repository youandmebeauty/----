import { CategoriesClient } from "./categories-client"

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

export function CategoriesServer() {
  return <CategoriesClient categories={categories} />
}
