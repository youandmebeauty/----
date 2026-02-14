import "server-only"
import { google } from "googleapis"

const BASE_URL = "https://youandme.tn"

/**
 * Google Indexing API service.
 * Uses the same Firebase service-account key (FIREBASE_ADMIN_KEY env var).
 *
 * Before using this you must:
 * 1. Enable the "Web Search Indexing API" in Google Cloud Console.
 * 2. Verify site ownership in Google Search Console.
 * 3. Add the service-account email as a delegated owner in Search Console
 *    (Settings → Users and permissions → Add user → Owner).
 */

export type IndexingAction = "URL_UPDATED" | "URL_DELETED"

export interface IndexingResult {
  url: string
  action: IndexingAction
  success: boolean
  error?: string
}

/** Build an authenticated Indexing API client. */
function getIndexingClient() {
  const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_KEY!)
  serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n")

  const auth = new google.auth.JWT({
    email: serviceAccount.client_email,
    key: serviceAccount.private_key,
    scopes: ["https://www.googleapis.com/auth/indexing"],
  })

  return google.indexing({ version: "v3", auth })
}

/** Notify Google that a single URL was updated or removed. */
export async function notifyUrlChange(
  url: string,
  action: IndexingAction = "URL_UPDATED",
): Promise<IndexingResult> {
  try {
    const indexing = getIndexingClient()

    await indexing.urlNotifications.publish({
      requestBody: { url, type: action },
    })

    console.info(`[google-indexing] ${action} → ${url}`)
    return { url, action, success: true }
  } catch (err: any) {
    const message = err?.errors?.[0]?.message || err.message || "Unknown error"
    console.error(`[google-indexing] FAILED ${action} → ${url}:`, message)
    return { url, action, success: false, error: message }
  }
}

/** Notify Google about multiple URLs at once (sequentially – API has no batch endpoint). */
export async function notifyUrlChanges(
  urls: string[],
  action: IndexingAction = "URL_UPDATED",
): Promise<IndexingResult[]> {
  const results: IndexingResult[] = []
  for (const url of urls) {
    results.push(await notifyUrlChange(url, action))
  }
  return results
}

/** Get the last notification status for a URL. */
export async function getUrlStatus(url: string) {
  try {
    const indexing = getIndexingClient()
    const res = await indexing.urlNotifications.getMetadata({ url })
    return { url, success: true, metadata: res.data }
  } catch (err: any) {
    const message = err?.errors?.[0]?.message || err.message || "Unknown error"
    return { url, success: false, error: message }
  }
}

// ── Convenience helpers for products & coffrets ──

export async function notifyProductIndexing(
  productId: string,
  slug: string,
  action: IndexingAction = "URL_UPDATED",
) {
  const url = `${BASE_URL}/product/${productId}-${slug}`
  return notifyUrlChange(url, action)
}

export async function notifyCoffretIndexing(
  coffretId: string,
  slug: string,
  action: IndexingAction = "URL_UPDATED",
) {
  const url = `${BASE_URL}/coffrets/${coffretId}-${slug}`
  return notifyUrlChange(url, action)
}
