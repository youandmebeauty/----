/**
 * Secure Model Client
 * 
 * Loads ONNX models from secure API endpoint instead of public folder
 */

interface ModelLoadOptions {
  cacheName?: string
  timeout?: number
}

export async function loadModelFromSecureAPI(
  modelName: string,
  options: ModelLoadOptions = {}
): Promise<ArrayBuffer> {
  const { cacheName = "onnx-models", timeout = 30000 } = options

  try {
    // Check cache first
    if (typeof caches !== "undefined") {
      const cache = await caches.open(cacheName)
      const cachedResponse = await cache.match(
        `/api/models?model=${encodeURIComponent(modelName)}`
      )

      if (cachedResponse) {
        const buffer = await cachedResponse.arrayBuffer()
        return buffer
      }
    }

    // Fetch from secure API endpoint
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    const response = await fetch(
      `/api/models?model=${encodeURIComponent(modelName)}`,
      {
        method: "GET",
        signal: controller.signal,
        headers: {
          "x-device-id": getOrCreateDeviceId(),
        },
      }
    )

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`Failed to load model: ${response.statusText}`)
    }

    const buffer = await response.arrayBuffer()

    // Cache the model
    if (typeof caches !== "undefined") {
      const cache = await caches.open(cacheName)
      await cache.put(
        `/api/models?model=${encodeURIComponent(modelName)}`,
        new Response(buffer, {
          headers: { "Content-Type": "application/octet-stream" },
        })
      )
    }

    return buffer
  } catch (error) {
    console.error(`[Model] Error loading ${modelName}:`, error)
    throw error
  }
}

/**
 * Get or create a device ID for tracking/rate limiting
 */
function getOrCreateDeviceId(): string {
  const STORAGE_KEY = "yob-device-id"

  if (typeof localStorage === "undefined") {
    return "anonymous"
  }

  let deviceId = localStorage.getItem(STORAGE_KEY)

  if (!deviceId) {
    deviceId = generateDeviceId()
    localStorage.setItem(STORAGE_KEY, deviceId)
  }

  return deviceId
}

function generateDeviceId(): string {
  return `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}
