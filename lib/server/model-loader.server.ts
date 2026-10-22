import "server-only"
import * as fs from "fs"
import * as path from "path"

const PRIVATE_MODELS_DIR = path.resolve(
  /*turbopackIgnore: true*/
  process.env.PRIVATE_MODELS_DIR ?? path.join(process.cwd(), "private-models")
)

const MODEL_NAME_RE = /^[\w.-]+\.(onnx|wasm)$/

function safeModelPath(modelName: string): string {
  if (!MODEL_NAME_RE.test(modelName) || modelName.includes("..")) {
    throw new Error("Invalid model name")
  }
  const full = path.join(/*turbopackIgnore: true*/ PRIVATE_MODELS_DIR, modelName)
  if (!full.startsWith(PRIVATE_MODELS_DIR + path.sep)) {
    throw new Error("Access denied: Invalid model path")
  }
  return full
}

const modelCache = new Map<string, Buffer>()

export async function getModelFile(modelName: string): Promise<Buffer> {
  const cached = modelCache.get(modelName)
  if (cached) return cached

  const p = safeModelPath(modelName)
  if (!fs.existsSync(/*turbopackIgnore: true*/ p)) {
    throw new Error(`Model file not found: ${modelName}`)
  }
  const buffer = fs.readFileSync(/*turbopackIgnore: true*/ p)
  modelCache.set(modelName, buffer)
  return buffer
}

const modelListCache = { timestamp: 0, models: [] as string[] }
const CACHE_TTL = 5 * 60 * 1000

export async function listAvailableModels(): Promise<string[]> {
  const now = Date.now()
  if (now - modelListCache.timestamp < CACHE_TTL && modelListCache.models.length > 0) {
    return modelListCache.models
  }
  if (!fs.existsSync(/*turbopackIgnore: true*/ PRIVATE_MODELS_DIR)) return []

  const models = fs
    .readdirSync(/*turbopackIgnore: true*/ PRIVATE_MODELS_DIR)
    .filter((f) => f.endsWith(".wasm") || f.endsWith(".onnx"))

  modelListCache.timestamp = now
  modelListCache.models = models
  return models
}

export async function getModelMetadata(modelName: string) {
  const p = safeModelPath(modelName)
  if (!fs.existsSync(/*turbopackIgnore: true*/ p)) return null

  const stats = fs.statSync(/*turbopackIgnore: true*/ p)
  return {
    name: modelName,
    size: stats.size,
    lastModified: stats.mtime,
    sizeInMB: (stats.size / 1024 / 1024).toFixed(2),
  }
}

export async function isModelCacheStale(lastFetch: number): Promise<boolean> {
  return Date.now() - lastFetch > 7 * 24 * 60 * 60 * 1000
}