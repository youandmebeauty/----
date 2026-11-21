import { NextRequest, NextResponse } from 'next/server'
import { sendToConversionsAPI } from '@/lib/services/meta-tracking'
import { createHash } from 'node:crypto'

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex')
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

function normalizePhone(phone: string): string {
  return phone.replace(/[\s().+-]/g, '')
}

/**
 * Meta Conversions API Route Handler
 *
 * Receives events from the client and forwards them to Meta's Conversions API
 * This ensures events are tracked server-side to bypass ad blockers and ensure accuracy
 *
 * Expected POST body:
 * {
 *   eventName: 'PageView' | 'ViewContent' | 'AddToCart' | 'Lead',
 *   eventId: string (UUID),
 *   customData?: {
 *     value?: number,
 *     contentIds?: string[],
 *     contentName?: string,
 *     numItems?: number
 *   },
 *   userData?: {
 *     email?: string,
 *     phone?: string
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Check if access token is configured
    if (!process.env.META_ACCESS_TOKEN) {
      return NextResponse.json(
        { 
          success: true,
          message: 'Server-side tracking skipped - META_ACCESS_TOKEN not configured',
          skipped: true 
        },
        { status: 200 }
      )
    }

    if (!process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: 'NEXT_PUBLIC_META_PIXEL_ID is not configured',
        },
        { status: 500 }
      )
    }

    // Validate request method
    if (request.method !== 'POST') {
      return NextResponse.json(
        { error: 'Method not allowed' },
        { status: 405 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { eventName, eventId, customData, userData } = body

    // Validate required fields
    if (!eventName || !eventId) {
      return NextResponse.json(
        { error: 'Missing required fields: eventName, eventId' },
        { status: 400 }
      )
    }

    // Validate eventName is a known Meta event
    const validEvents = ['PageView', 'ViewContent', 'AddToCart', 'Lead']
    if (!validEvents.includes(eventName)) {
      return NextResponse.json(
        { error: `Invalid eventName. Must be one of: ${validEvents.join(', ')}` },
        { status: 400 }
      )
    }

    // Send to Meta Conversions API
    const hashedUserData = userData
      ? {
          email: typeof userData.email === 'string' && normalizeEmail(userData.email)
            ? sha256(normalizeEmail(userData.email))
            : undefined,
          phone: typeof userData.phone === 'string' && normalizePhone(userData.phone)
            ? sha256(normalizePhone(userData.phone))
            : undefined,
          clientIpAddress: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
            || request.headers.get('x-real-ip')?.trim()
            || undefined,
          clientUserAgent: request.headers.get('user-agent')?.trim() || undefined,
        }
      : {
          clientIpAddress: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
            || request.headers.get('x-real-ip')?.trim()
            || undefined,
          clientUserAgent: request.headers.get('user-agent')?.trim() || undefined,
        }

    await sendToConversionsAPI(
      eventName,
      eventId,
      customData,
      hashedUserData
    )

    return NextResponse.json(
      {
        success: true,
        message: `Event "${eventName}" sent to Meta Conversions API`,
        eventId,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in Meta Conversions API route:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send event to Meta',
      },
      { status: 502 }
    )
  }
}
