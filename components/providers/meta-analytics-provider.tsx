'use client'

import { useMetaPageTracking } from '@/hooks/use-meta-page-tracking'

/**
 * Meta Analytics Provider Component
 * 
 * This component initializes Meta Pixel page tracking on route changes
 * Place this early in your layout hierarchy to ensure tracking works for all pages
 */
export function MetaAnalyticsProvider() {
  useMetaPageTracking()
  return null
}
