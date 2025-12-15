import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getProductById, getRelatedProducts } from "@/lib/services/product-service"
import { ProductClient } from "@/components/product/product-client"
import { RelatedProducts } from "@/components/product/related-products"
import { generateSlug } from "@/lib/product-url"

interface ProductPageProps {
  params: {
    slug: string
  }
  searchParams: {
    id?: string
  }
}

export async function generateMetadata({ 
  searchParams 
}: ProductPageProps): Promise<Metadata> {
  if (!searchParams.id) {
    return { title: "Produit Non Trouvé" }
  }

  const product = await getProductById(searchParams.id)

  if (!product) {
    return { title: "Produit Non Trouvé" }
  }

  const slug = generateSlug(product.name, { 
    includeBrand: product.brand 
  })
  const canonicalUrl = `https://youandme.tn/product/${slug}?id=${product.id}`

  return {
    title: `${product.name} - ${product.brand} | YourStore`,
    description: product.description || `Achetez ${product.name} de ${product.brand}. ${product.category}. Prix: ${product.price} TND`,
    
    // Canonical URL (prevents duplicate content issues)
    alternates: {
      canonical: canonicalUrl,
    },
    
    // Keywords
    keywords: [
      product.name,
      product.brand,
      product.category,
      product.subcategory!,
      'cosmétique',
      'beauté',
      'Tunisie'
    ],
    
    // Open Graph (for social media)
    openGraph: {
      title: `${product.name} - ${product.brand}`,
      description: product.description,
      url: canonicalUrl,
      siteName: 'You & Me Beauty',
      images: [
        {
          url: product.image || '/placeholder.svg',
          width: 1200,
          height: 630,
          alt: `${product.name} - ${product.brand}`,
        },
      ],
      locale: 'fr_TN',
      type: 'website',
    },
    
    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} - ${product.brand}`,
      description: product.description,
      images: [product.image || '/placeholder.svg'],
    },
    
    // Robots
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}

export default async function ProductPage({ searchParams }: ProductPageProps) {
  // Require ID in query params
  if (!searchParams.id) {
    notFound()
  }

  const product = await getProductById(searchParams.id)

  if (!product) {
    notFound()
  }

  // Generate expected slug
  const expectedSlug = generateSlug(product.name, {
    includeBrand: product.brand
  })

  // JSON-LD Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.image,
    description: product.description,
    brand: {
      '@type': 'Brand',
      name: product.brand,
    },
    offers: {
      '@type': 'Offer',
      url: `https://youandme.tn/product/${expectedSlug}?id=${product.id}`,
      priceCurrency: 'TND',
      price: product.price,
      availability: product.quantity > 0 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'You & Me beauty',
      },
    },
  }

  // Fetch related products
  const relatedProducts = await getRelatedProducts(
    product.id,
    product.category,
    product.brand,
    product.subcategory,
    4
  )

  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <ProductClient product={product} />
      <RelatedProducts products={relatedProducts} currentProduct={product} />
    </>
  )
}