'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { trackPageView, generateEventId } from '@/lib/services/meta-tracking'

/**
 * Hook to track PageView events on route changes
 * Use this in a client component wrapper in your layout
 */
export function useMetaPageTracking(): void {
  const pathname = usePathname()

  useEffect(() => {
    // Generate a new event ID for each page view
    const eventId = generateEventId()
    
    // Track page view (client-side only - sufficient for PageView events)
    trackPageView(eventId)
  }, [pathname])
}
