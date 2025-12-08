import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getProductById, getRelatedProducts } from "@/lib/services/product-service"
import { ProductClient } from "@/components/product/product-client"
import { RelatedProducts } from "@/components/product/related-products"

interface ProductPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await getProductById(params.id)

  if (!product) {
    return {
      title: "Produit Non Trouvé",
    }
  }

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [
        {
          url: product.image || "/placeholder.svg",
          width: 800,
          height: 600,
          alt: product.name,
        },
      ],
    },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProductById(params.id)

  if (!product) {
    notFound()
  }

  // Fetch related products (same category and brand)
  const relatedProducts = await getRelatedProducts(
    product.id,
    product.category,
    product.brand,
    product.subcategory,
    4
  )

  return (
    <>
      <ProductClient product={product} />
      <RelatedProducts products={relatedProducts} currentProduct={product} />
    </>
  )
}