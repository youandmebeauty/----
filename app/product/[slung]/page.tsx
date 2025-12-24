"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { getProductById, getRelatedProducts } from "@/lib/services/product-service"
import { ProductClient } from "@/components/product/product-client"
import { RelatedProducts } from "@/components/product/related-products"
import type { Product } from "@/lib/models"

export default function ProductPage() {
  const searchParams = useSearchParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const productId = searchParams.get("id")
    
    if (!productId) {
      setError(true)
      setLoading(false)
      return
    }

    const fetchProduct = async () => {
      try {
        const fetchedProduct = await getProductById(productId)
        
        if (!fetchedProduct) {
          setError(true)
          setLoading(false)
          return
        }

        setProduct(fetchedProduct)

        // Fetch related products
        const related = await getRelatedProducts(
          fetchedProduct.id,
          fetchedProduct.category,
          fetchedProduct.brand,
          fetchedProduct.subcategory,
          4
        )
        setRelatedProducts(related)
      } catch (err) {
        console.error("Error fetching product:", err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [searchParams])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement du produit...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <p className="text-xl text-muted-foreground mb-8">Produit non trouvé</p>
          <a 
            href="/shop" 
            className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Retourner à la boutique
          </a>
        </div>
      </div>
    )
  }

  return (
    <>
      <ProductClient product={product} />
      <RelatedProducts products={relatedProducts} currentProduct={product} />
    </>
  )
}