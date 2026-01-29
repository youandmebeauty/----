import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getCoffrets, getCoffretById } from "@/lib/services/coffret-service"
import { getProducts } from "@/lib/services/product-service"
import { generateSlug } from "@/lib/product-url"
import { CoffretDetailClient } from "@/components/coffret/coffret-detail-client"

interface CoffretPageProps {
  params: Promise<{ slug: string }>
}



export async function generateMetadata({ 
  params 
}: CoffretPageProps): Promise<Metadata> {
  const resolvedParams = (await params) as { slug: string }
  const coffretId = resolvedParams?.slug?.split("-")[0]
  
  if (!coffretId) {
    return {
      title: "Coffret non trouvé - You & Me Beauty",
      description: "Le coffret demandé n'existe pas.",
    }
  }

  try {
    const coffret = await getCoffretById(coffretId)
    
    if (!coffret) {
      return {
        title: "Coffret non trouvé - You & Me Beauty",
        description: "Le coffret demandé n'existe pas.",
      }
    }

    // Build canonical URL
    const canonicalUrl = `https://youandme.tn/coffrets/${resolvedParams.slug}`
    
    // Get first image
    const coffretImage = coffret.images && coffret.images.length > 0 
      ? coffret.images[0] 
      : "https://youandme.tn/og-image.png"

    // Calculate pricing info
    const hasDiscount = coffret.originalPrice && coffret.originalPrice > coffret.price
    const discountPercentage = hasDiscount 
      ? Math.round(((coffret.originalPrice! - coffret.price) / coffret.originalPrice!) * 100)
      : 0
    
    const priceText = hasDiscount 
      ? `${coffret.price.toFixed(2)} TND (${discountPercentage}% de réduction)`
      : `${coffret.price.toFixed(2)} TND`

    // Create SEO-friendly description
    const description = coffret.description 
      ? coffret.description.substring(0, 160) + (coffret.description.length > 160 ? '...' : '')
      : `${coffret.name} - Coffret cadeau disponible chez You & Me Beauty. Prix: ${priceText}.`

    return {
      title: `${coffret.name} - Coffret Cadeau | You & Me Beauty`,
      description,
      keywords: [
        coffret.name,
        'coffret cadeau',
        'coffret beauté',
        'cadeau',
        'You & Me Beauty',
        coffret.category || 'beauté',
        ...(coffret.tags || [])
      ],
      alternates: {
        canonical: canonicalUrl,
      },

      twitter: {
        card: "summary_large_image",
        title: `${coffret.name} - Coffret Cadeau`,
        description,
        images: [coffretImage],
      },
      other: {
        "product:price:amount": coffret.price.toString(),
        "product:price:currency": "TND",
        "product:availability": coffret.stock === 0 ? "out of stock" : "in stock",
        "product:condition": "new",
        "product:category": "Coffret Cadeau",
        ...(hasDiscount && { "product:sale_price": coffret.price.toString() }),
        ...(hasDiscount && { "product:original_price": coffret.originalPrice!.toString() }),
      },
      robots: {
        index: coffret.stock !== 0,
        follow: true,
      }
    }
  } catch (error) {
    console.error("Error generating metadata:", error)
    return {
      title: "Coffret - You & Me Beauty",
      description: "Découvrez nos coffrets cadeaux de qualité.",
    }
  }
}

export default async function CoffretPage({ 
  params 
}: CoffretPageProps) {
  const resolvedParams = (await params) as { slug: string }
  const coffretId = resolvedParams?.slug?.split("-")[0]
  
  if (!coffretId) {
    notFound()
  }

  try {
    // Fetch coffret
    const coffret = await getCoffretById(coffretId)
    
    if (!coffret) {
      notFound()
    }

    // Fetch all products and coffrets in parallel
    const [allProducts, allCoffrets] = await Promise.all([
      getProducts(),
      getCoffrets()
    ])

    // Filter products that are in this coffret
    const coffretProducts = allProducts.filter(p => 
      coffret.productIds?.includes(p.id)
    )

    // Get related coffrets (similar price range or same category)
    const relatedCoffrets = allCoffrets
      .filter(c => c.id !== coffret.id)
      .filter(c => {
        // Same category if available
        if (coffret.category && c.category === coffret.category) {
          return true
        }
        
        // Or similar price range (within 25%)
        const priceDiff = Math.abs(c.price - coffret.price) / coffret.price
        return priceDiff <= 0.25
      })
      .slice(0, 4)

    // Build URLs
    const Slug = generateSlug(coffret.name)
    const canonicalUrl = `https://youandme.tn/coffrets/${resolvedParams.slug}`

    // ========================================================================
    // STRUCTURED DATA - Breadcrumb
    // ========================================================================
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
          name: "Coffrets",
          item: "https://youandme.tn/coffrets",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: coffret.name,
          item: canonicalUrl,
        },
      ],
    }

    // ========================================================================
    // STRUCTURED DATA - Product
    // ========================================================================
    const productJsonLd = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: coffret.name,
      image: coffret.images && coffret.images.length > 0 ? coffret.images : [],
      description: coffret.description,
      sku: coffret.id,
      category: "Coffret Cadeau",
      url: canonicalUrl,
      brand: {
        "@type": "Brand",
        name: "You & Me Beauty"
      },
      offers: {
        "@type": "Offer",
        priceCurrency: "TND",
        price: coffret.price,
        priceValidUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        availability: coffret.stock === 0 
          ? "https://schema.org/OutOfStock" 
          : "https://schema.org/InStock",
        url: canonicalUrl,
        ...(coffret.originalPrice && coffret.originalPrice > coffret.price && {
          priceSpecification: {
            "@type": "PriceSpecification",
            price: coffret.price,
            priceCurrency: "TND",
          }
        })
      },

      // Include product IDs as part numbers
      ...(coffret.productIds && coffret.productIds.length > 0 && {
        isRelatedTo: coffret.productIds.map(id => ({
          "@type": "Product",
          productID: id
        }))
      })
    }

    // ========================================================================
    // STRUCTURED DATA - ItemList (Products in Coffret)
    // ========================================================================
    const itemListJsonLd = coffretProducts.length > 0 ? {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: `Produits inclus dans ${coffret.name}`,
      numberOfItems: coffretProducts.length,
      itemListElement: coffretProducts.map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Product",
          name: product.name,
          image: product.images?.[0] || product.image,
          description: product.description,
        }
      }))
    } : null

    return (
      <>
        {/* Breadcrumb Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
        
        {/* Product Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
        />
        
        {/* ItemList Schema (if products available) */}
        {itemListJsonLd && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
          />
        )}

        {/* Main Content */}
        <CoffretDetailClient 
          coffret={coffret}
          products={coffretProducts}
          relatedCoffrets={relatedCoffrets}
        />
      </>
    )
  } catch (error) {
    console.error("Error fetching coffret:", error)
    notFound()
  }
}