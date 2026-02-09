'use client'

import {
  generateEventId,
  trackViewContent,
  trackAddToCart,
  trackLead,
  type MetaEventName,
} from '@/lib/services/meta-tracking'

/**
 * Send event to server-side Conversions API for duplicate tracking and ad blocker bypass
 */
async function sendEventToServer(
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
): Promise<void> {
  // Skip server-side tracking if access token not configured
  if (typeof window === 'undefined' && !process.env.META_ACCESS_TOKEN) {
    return // Silently skip on server without token
  }

  try {
    await fetch('/api/meta/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventName,
        eventId,
        customData,
        userData,
      }),
    })
  } catch (error) {
    console.error(`Error sending ${eventName} event to server:`, error)
  }
}

// ============================================================================
// Product Page Tracking
// ============================================================================

/**
 * Track product page view
 * Client-side only - sufficient for ViewContent events
 */
export async function trackProductView(
  productId: string,
  productName: string,
  price: number
): Promise<string> {
  const eventId = generateEventId()

  // Browser-side tracking (sufficient for ViewContent)
  trackViewContent(productId, productName, price, eventId)

  return eventId
}

// ============================================================================
// Cart Tracking
// ============================================================================

/**
 * Track add to cart action
 * Call this when user clicks "Add to Cart" button
 */
export async function trackCartAddition(
  items: Array<{ id: string; name: string; price: number; quantity: number }>
): Promise<string> {
  const eventId = generateEventId()
  const contentIds = items.map(item => item.id)
  const totalValue = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0)

  // Browser-side tracking
  trackAddToCart(contentIds, totalValue, totalQuantity, eventId)

  // Server-side tracking
  await sendEventToServer('AddToCart', eventId, {
    value: totalValue,
    contentIds,
    numItems: totalQuantity,
  })

  return eventId
}

// ============================================================================
// Order/Conversion Tracking
// ============================================================================

/**
 * Track order conversion (Lead event)
 * 
 * IMPORTANT: Call this ONLY after the backend confirms the order was successfully saved
 * Never call this on button click alone
 * 
 * @param orderId - The order ID from backend response
 * @param orderValue - Total order amount
 * @param orderItems - Items in the order
 * @param customerEmail - Customer email (optional, for user matching)
 * @param customerPhone - Customer phone (optional, for user matching)
 */
export async function trackOrderConversion(
  orderId: string,
  orderValue: number,
  orderItems: Array<{ id: string; name: string; quantity: number }>,
  customerEmail?: string,
  customerPhone?: string
): Promise<string> {
  const eventId = generateEventId()
  const contentIds = orderItems.map(item => item.id)

  trackLead(orderValue, eventId)

  // Server-side tracking with customer data for better attribution
  await sendEventToServer(
    'Lead',
    eventId,
    {
      value: orderValue,
      contentIds,
      numItems: orderItems.reduce((sum, item) => sum + item.quantity, 0),
    },
    {
      email: customerEmail,
      phone: customerPhone,
    }
  )

  return eventId
}

/**
 * Send conversion event from server-side after order creation
 * Use this in API routes when creating orders to ensure Lead tracking even if client-side fails
 */
export async function sendConversionEventFromServer(
  orderId: string,
  orderValue: number,
  orderItems: Array<{ id: string; quantity: number }>,
  customerEmail?: string,
  customerPhone?: string
): Promise<{ success: boolean; eventId: string }> {
  const eventId = generateEventId()
  const contentIds = orderItems.map(item => item.id)

  try {
    await fetch('/api/meta/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventName: 'Lead',
        eventId,
        customData: {
          value: orderValue,
          contentIds,
          numItems: orderItems.reduce((sum, item) => sum + item.quantity, 0),
        },
        userData: {
          email: customerEmail,
          phone: customerPhone,
        },
      }),
    })

    return { success: true, eventId }
  } catch (error) {
    console.error('Error sending order conversion to Meta:', error)
    return { success: false, eventId }
  }
}
