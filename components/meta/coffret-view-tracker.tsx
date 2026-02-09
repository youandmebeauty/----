'use client'

import { useEffect, useRef } from 'react'
import { trackProductView } from '@/lib/services/meta-events'

interface CoffretViewTrackerProps {
  coffretId: string
  coffretName: string
  coffretPrice: number
}

export function CoffretViewTracker({
  coffretId,
  coffretName,
  coffretPrice,
}: CoffretViewTrackerProps) {
  const trackedRef = useRef<string | null>(null)

  useEffect(() => {
    // Only track if we haven't tracked this coffret yet
    if (trackedRef.current !== coffretId) {
      trackProductView(coffretId, coffretName, coffretPrice)
      trackedRef.current = coffretId
    }
  }, [coffretId, coffretName, coffretPrice])

  return null
}
