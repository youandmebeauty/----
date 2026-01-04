import { getProductById, getRelatedProducts } from "@/lib/services/product-service"
import { ProductClient } from "@/components/product/product-client"
import { RelatedProducts } from "@/components/product/related-products"
import { Metadata } from "next"
import { notFound } from "next/navigation"
import { generateSlung } from "@/lib/product-url"
import { SHOP_CATEGORIES } from "@/lib/category-data"
import React from "react"

interface ProductPageProps {
  params: { slung: string }
  searchParams: { [key: string]: string | undefined }
}

export async function generateMetadata({ 
  params, 
  searchParams 
}: ProductPageProps): Promise<Metadata> {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  const productId = resolvedSearchParams.id
  
  if (!productId) {
    return {
      title: "Produit non trouvé - You & Me Beauty",
      description: "Le produit demandé n'existe pas.",
    }
  }

  try {
    const product = await getProductById(productId)
    
    if (!product) {
      return {
        title: "Produit non trouvé - You & Me Beauty",
        description: "Le produit demandé n'existe pas.",
      }
    }

    // Use the actual slug from URL params for canonical URL
    const canonicalUrl = `https://youandme.tn/product/${resolvedParams.slung}?id=${product.id}`
    
    // Get first image
    const productImage = product.images && product.images.length > 0 
      ? product.images[0] 
      : product.image || "https://youandme.tn/og-image.png"

    // Create SEO-friendly description
    const description = product.description 
      ? product.description.substring(0, 160) + (product.description.length > 160 ? '...' : '')
      : `${product.name} - ${product.brand || ''} disponible chez You & Me Beauty. Prix: ${product.price} TND.`

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
        title: `${product.name} - ${product.brand || 'You & Me Beauty'}`,
        description,
        images: [productImage],
      },
      other: {
        "product:price:amount": product.price.toString(),
        "product:price:currency": "TND",
        "product:availability": product.quantity > 0 ? "in stock" : "out of stock",
        "product:brand": product.brand || "You & Me Beauty",
        "product:category": product.category,
      },
    }
  } catch (error) {
    console.error("Error generating metadata:", error)
    return {
      title: "Produit - You & Me Beauty",
      description: "Découvrez nos produits de beauté de qualité.",
    }
  }
}

export default async function ProductPage({ searchParams }: ProductPageProps) {
  const resolvedSearchParams = await searchParams
  const productId = resolvedSearchParams.id
  
  if (!productId) {
    notFound()
  }

  try {
    const product = await getProductById(productId)
    
    if (!product) {
      notFound()
    }

    // Fetch related products
    const relatedProducts = await getRelatedProducts(
      product.id,
      product.category,
      product.brand,
      product.subcategory,
      4
    )

    const slug = generateSlung(product.name, { includeBrand: product.brand })
    const canonicalUrl = `https://youandme.tn/product/${slug}?id=${product.id}`
    const categoryLabel = (() => {
      const category = SHOP_CATEGORIES.find(cat => cat.id === product.category)
      if (!category) return product.category
      return category.label
    })()

    const breadcrumbJsonLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Accueil",
          item: "https://youandme.tn",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Boutique",
          item: "https://youandme.tn/shop",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: categoryLabel,
          item: `https://youandme.tn/shop?category=${product.category}`,
        },
        {
          "@type": "ListItem",
          position: 4,
          name: product.name,
          item: canonicalUrl,
        },
      ],
    }

    const productJsonLd = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      image: product.images && product.images.length > 0 ? product.images : (product.image ? [product.image] : []),
      description: product.longDescription || product.description,
      brand: product.brand,
      sku: product.id,
      category: product.category,
      url: canonicalUrl,
      offers: {
        "@type": "Offer",
        priceCurrency: "TND",
        price: product.price,
        availability: product.quantity > 0 ? "http://schema.org/InStock" : "http://schema.org/OutOfStock",
        url: canonicalUrl,
      },
      additionalProperty: (() => {
        const top = product.perfumeNotes?.top ?? []
        const heart = product.perfumeNotes?.heart ?? []
        const base = product.perfumeNotes?.base ?? []
        const entries = [
          top.length > 0 && { "@type": "PropertyValue", name: "Notes de tête", value: top.join(", ") },
          heart.length > 0 && { "@type": "PropertyValue", name: "Notes de cœur", value: heart.join(", ") },
          base.length > 0 && { "@type": "PropertyValue", name: "Notes de fond", value: base.join(", ") },
        ].filter(Boolean)
        return entries.length > 0 ? entries : undefined
      })(),
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
  } catch (error) {
    console.error("Error fetching product:", error)
    notFound()
  }
}