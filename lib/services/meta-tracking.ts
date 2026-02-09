// ============================================================================
// Types & Interfaces
// ============================================================================

export type MetaEventName = 'PageView' | 'ViewContent' | 'AddToCart' | 'Lead'

export interface MetaEventData {
  eventName: MetaEventName
  eventId?: string
  customData?: Record<string, any>
}

export interface ConversionsAPIPayload {
  data: Array<{
    event_name: MetaEventName
    event_time: number
    event_id: string
    user_data?: {
      em?: string // hashed email
      ph?: string // hashed phone
      ge?: string // gender
      db?: string // date of birth
      ln?: string // last name
      fn?: string // first name
      city?: string
      st?: string // state
      zp?: string // postal code
      country?: string
    }
    custom_data?: {
      value?: number
      currency?: string
      content_name?: string
      content_type?: string
      content_ids?: string[]
      num_items?: number
    }
    action_source: 'website'
  }>
  access_token: string
}

// ============================================================================
// Event ID Management (Deduplication)
// ============================================================================

/**
 * Generate a unique event ID for deduplication
 * Same ID sent to both Pixel (browser) and Conversions API (server)
 * Uses crypto.randomUUID() which is built-in to Node.js and modern browsers
 */
export function generateEventId(): string {
  if (typeof window !== 'undefined') {
    // Browser environment
    return crypto.randomUUID ? crypto.randomUUID() : uuidv4Fallback()
  } else {
    // Node.js environment (server-side)
    return crypto.randomUUID ? crypto.randomUUID() : uuidv4Fallback()
  }
}

/**
 * Fallback UUID v4 generator if crypto.randomUUID is not available
 * Format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
 */
function uuidv4Fallback(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// In-memory tracking set for immediate race condition prevention
const trackedEvents = new Set<string>()

/**
 * Store event ID in sessionStorage to prevent duplicate tracking
 */
export function storeEventId(eventName: MetaEventName, eventId: string): void {
  if (typeof window !== 'undefined') {
    const key = `meta_event_${eventName}_${eventId}`
    trackedEvents.add(key)
    sessionStorage.setItem(key, 'tracked')
  }
}

/**
 * Check if event has already been tracked (browser-side deduplication)
 */
export function isEventTracked(eventName: MetaEventName, eventId: string): boolean {
  if (typeof window === 'undefined') return false
  const key = `meta_event_${eventName}_${eventId}`
  // Check in-memory first (immediate), then sessionStorage (persistent)
  return trackedEvents.has(key) || sessionStorage.getItem(key) === 'tracked'
}

// ============================================================================
// Browser-side Pixel Tracking
// ============================================================================

/**
 * Track PageView event via Meta Pixel
 */
export function trackPageView(eventId?: string): void {
  if (typeof window === 'undefined') return

  const finalEventId = eventId || generateEventId()

  if (isEventTracked('PageView', finalEventId)) {
    console.debug('PageView already tracked:', finalEventId)
    return
  }

  try {
    if (window.fbq) {
      window.fbq('track', 'PageView', {}, { eventID: finalEventId })
      storeEventId('PageView', finalEventId)
    }
  } catch (error) {
    console.error('Error tracking PageView:', error)
  }
}

/**
 * Track ViewContent event (product page view)
 */
export function trackViewContent(
  contentId: string,
  contentName: string,
  value: number,
  eventId?: string
): void {
  if (typeof window === 'undefined') return

  const finalEventId = eventId || generateEventId()

  if (isEventTracked('ViewContent', finalEventId)) {
    console.debug('ViewContent already tracked:', finalEventId)
    return
  }

  try {
    if (window.fbq) {
      window.fbq('track', 'ViewContent', {
        content_ids: [contentId],
        content_name: contentName,
        content_type: 'product',
        value: value,
        currency: 'TND',
      }, { eventID: finalEventId })
      storeEventId('ViewContent', finalEventId)
    }
  } catch (error) {
    console.error('Error tracking ViewContent:', error)
  }
}

/**
 * Track AddToCart event
 */
export function trackAddToCart(
  contentIds: string[],
  value: number,
  numItems: number,
  eventId?: string
): void {
  if (typeof window === 'undefined') return

  const finalEventId = eventId || generateEventId()

  if (isEventTracked('AddToCart', finalEventId)) {
    console.debug('AddToCart already tracked:', finalEventId)
    return
  }

  try {
    if (window.fbq) {
      window.fbq('track', 'AddToCart', {
        content_ids: contentIds,
        content_type: 'product',
        value: value,
        currency: 'TND',
        num_items: numItems,
      }, { eventID: finalEventId })
      storeEventId('AddToCart', finalEventId)
    }
  } catch (error) {
    console.error('Error tracking AddToCart:', error)
  }
}

/**
 * Track Lead event (order conversion)
 * This should only be called after backend confirms order was saved
 */
export function trackLead(
  orderValue: number,
  eventId?: string
): void {
  if (typeof window === 'undefined') return

  const finalEventId = eventId || generateEventId()

  if (isEventTracked('Lead', finalEventId)) {
    console.debug('Lead already tracked:', finalEventId)
    return
  }

  try {
    if (window.fbq) {
      window.fbq('track', 'Lead', {
        value: orderValue,
        currency: 'TND',
      }, { eventID: finalEventId })
      storeEventId('Lead', finalEventId)
    }
  } catch (error) {
    console.error('Error tracking Lead:', error)
  }
}

/**
 * Generic track event function
 */
export function trackEvent(
  eventName: MetaEventName,
  data?: Record<string, any>,
  eventId?: string
): void {
  if (typeof window === 'undefined') return

  const finalEventId = eventId || generateEventId()

  if (isEventTracked(eventName, finalEventId)) {
    console.debug(`Event ${eventName} already tracked:`, finalEventId)
    return
  }

  try {
    if (window.fbq) {
      window.fbq('track', eventName, data || {}, { eventID: finalEventId })
      storeEventId(eventName, finalEventId)
    }
  } catch (error) {
    console.error(`Error tracking event ${eventName}:`, error)
  }
}

// ============================================================================
// Conversions API (Server-side)
// ============================================================================

/**
 * Send event to Meta Conversions API
 * This must be called server-side to ensure accurate attribution and bypass ad blockers
 */
export async function sendToConversionsAPI(
  eventName: MetaEventName,
  eventId: string,
  customData?: {
    value?: number
    contentIds?: string[]
    contentName?: string
    numItems?: number
  },
  userData?: {
    email?: string
    phone?: string
  }
): Promise<Response | null> {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID
  const accessToken = process.env.META_ACCESS_TOKEN

  if (!accessToken) {
    console.warn('META_ACCESS_TOKEN not configured - server-side tracking disabled. Client-side tracking still active.')
    return null
  }

  if (!pixelId) {
    console.error('NEXT_PUBLIC_META_PIXEL_ID not configured')
    return null
  }

  const eventTime = Math.floor(Date.now() / 1000)

  const payload: ConversionsAPIPayload = {
    data: [
      {
        event_name: eventName,
        event_time: eventTime,
        event_id: eventId,
        action_source: 'website',
        custom_data: {
          value: customData?.value,
          currency: 'TND',
          content_ids: customData?.contentIds,
          content_name: customData?.contentName,
          num_items: customData?.numItems,
        },
      },
    ],
    access_token: accessToken,
  }

  // Add user data if provided (email/phone should be hashed on client before sending)
  if (userData?.email || userData?.phone) {
    payload.data[0].user_data = {}
    if (userData.email) payload.data[0].user_data!.em = userData.email
    if (userData.phone) payload.data[0].user_data!.ph = userData.phone
  }

  const url = `https://graph.facebook.com/v18.0/${pixelId}/events`

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Meta Conversions API error:', errorData)
      throw new Error(`Meta API error: ${response.status}`)
    }

    return response
  } catch (error) {
    console.error('Error sending to Meta Conversions API:', error)
    throw error
  }
}

// ============================================================================
// Type Guard for window.fbq
// ============================================================================

declare global {
  interface Window {
    fbq?: (action: string, event: string, data?: Record<string, any>, opts?: Record<string, any>) => void
    FB?: any
  }
}
