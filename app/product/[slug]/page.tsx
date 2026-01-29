import { getProducts, getProductById, getRelatedProducts } from "@/lib/services/product-service"
import { ProductClient } from "@/components/product/product-client"
import { RelatedProducts } from "@/components/product/related-products"
import { Metadata } from "next"
import { notFound } from "next/navigation"
import { generateSlug } from "@/lib/product-url"
import { SHOP_CATEGORIES } from "@/lib/category-data"

/* ---------------------------------------------
   Enable ISR (optional but recommended)
---------------------------------------------- */
export const revalidate = 3600 // 1 hour

interface ProductPageProps {
  params: { slug: string }
}

/* ---------------------------------------------
   Static generation of all product pages
---------------------------------------------- */
export async function generateStaticParams() {
  const products = await getProducts()

  return products.map(product => ({
    slug: `${product.id}-${generateSlug(product.name, { includeBrand: product.brand })}`,
  }))
}

/* ---------------------------------------------
   Metadata (runs at build / revalidate time)
---------------------------------------------- */
export async function generateMetadata(
  { params }: ProductPageProps
): Promise<Metadata> {
  const resolvedParams = (await params) as { slug: string }
  const productId = resolvedParams?.slug?.split("-")[0]

  if (!productId) {
    return {
      title: "Produit non trouvé - You & Me Beauty",
      description: "Le produit demandé n'existe pas.",
    }
  }

  const product = await getProductById(productId)

  if (!product) {
    return {
      title: "Produit non trouvé - You & Me Beauty",
      description: "Le produit demandé n'existe pas.",
    }
  }

  const canonicalUrl = `https://youandme.tn/product/${resolvedParams.slug}`

  const productImage =
    product.images?.[0] ??
    product.image ??
    "https://youandme.tn/og-image.png"

  const description = product.description
    ? product.description.slice(0, 160)
    : `${product.name} disponible chez You & Me Beauty.`

      return {
      title: `${product.name} - ${product.brand || 'You & Me Beauty'}`,
      description,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title: `${product.name} - ${product.brand || 'You & Me Beauty'}`,
        description,
        url: canonicalUrl,
        siteName: "You & Me Beauty",
        locale: "fr_TN",
        type: "website",
        images: [
          {
            url: productImage,
            width: 800,
            height: 800,
            alt: product.name,
          },
        ],
      },
      twitter: {
      card: "summary_large_image",
      title: `${product.name} - ${product.brand ?? "You & Me Beauty"}`,
      description,
      images: [productImage],
    },
  }
}

/* ---------------------------------------------
   Page (SSG)
---------------------------------------------- */
export default async function ProductPage({ params }: ProductPageProps) {
  const resolvedParams = (await params) as { slug: string }
  const productId = resolvedParams?.slug?.split("-")[0]

  if (!productId) notFound()

  const product = await getProductById(productId)

  if (!product) notFound()

  const relatedProducts = await getRelatedProducts(
    product.id,
    product.category,
    product.brand,
    product.subcategory,
    4
  )

  const canonicalUrl = `https://youandme.tn/product/${resolvedParams.slug}`

  const categoryLabel =
    SHOP_CATEGORIES.find(cat => cat.id === product.category)?.label ??
    product.category

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: "https://youandme.tn" },
      { "@type": "ListItem", position: 2, name: "Boutique", item: "https://youandme.tn/shop" },
      { "@type": "ListItem", position: 3, name: categoryLabel, item: `https://youandme.tn/shop?category=${product.category}` },
      { "@type": "ListItem", position: 4, name: product.name, item: canonicalUrl },
    ],
  }

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images ?? [],
    description: product.longDescription ?? product.description,
    brand: product.brand,
    sku: product.id,
    category: product.category,
    url: canonicalUrl,
    offers: {
      "@type": "Offer",
      priceCurrency: "TND",
      price: product.price,
      availability:
        product.quantity > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: canonicalUrl,
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />

      <ProductClient product={product} />
      <RelatedProducts products={relatedProducts} currentProduct={product} />
    </>
  )
}
