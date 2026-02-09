'use client'

import { useEffect, useRef } from 'react'
import { trackProductView } from '@/lib/services/meta-events'

interface ProductViewTrackerProps {
  productId: string
  productName: string
  productPrice: number
}

export function ProductViewTracker({
  productId,
  productName,
  productPrice,
}: ProductViewTrackerProps) {
  const trackedRef = useRef<string | null>(null)

  useEffect(() => {
    // Only track if we haven't tracked this product yet
    if (trackedRef.current !== productId) {
      trackProductView(productId, productName, productPrice)
      trackedRef.current = productId
    }
  }, [productId, productName, productPrice])

  return null
}
