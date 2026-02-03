"use server"

import * as fs from "fs"
import * as path from "path"

/**
 * Secure ONNX Model Loader - Vercel Compatible
 * Loads models from private directory instead of exposing them in public folder
 * Optimized for Vercel's serverless environment
 */

// Determine models directory - supports both development and Vercel production
const getModelsDirectory = (): string => {
  if (process.env.PRIVATE_MODELS_DIR) {
    return process.env.PRIVATE_MODELS_DIR
  }

  // In Vercel, use absolute path to project root
  const projectRoot = process.cwd()
  return path.join(projectRoot, "private-models")
}

const PRIVATE_MODELS_DIR = getModelsDirectory()

/**
 * Get model file from secure private directory
 * Only called server-side, never exposed to client
 * Cached in-memory for subsequent requests (Vercel function reuse)
 */
const modelCache = new Map<string, Buffer>()

export async function getModelFile(modelName: string): Promise<Buffer> {
  // Check in-memory cache first (reused across requests in same function instance)
  if (modelCache.has(modelName)) {
    console.log(`[Model Cache] Hit for ${modelName}`)
    return modelCache.get(modelName)!
  }

  // Prevent directory traversal attacks
  if (modelName.includes("..") || modelName.includes("/") || modelName.includes("\\")) {
    throw new Error("Invalid model name: path traversal detected")
  }

  const modelPath = path.join(PRIVATE_MODELS_DIR, modelName)

  // Ensure the model file exists and is within the private directory
  const resolvedPath = path.resolve(modelPath)
  const resolvedDir = path.resolve(PRIVATE_MODELS_DIR)

  if (!resolvedPath.startsWith(resolvedDir)) {
    throw new Error("Access denied: Invalid model path")
  }

  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Model file not found: ${modelName}`)
  }

  // Read and cache the model
  const buffer = fs.readFileSync(resolvedPath)
  modelCache.set(modelName, buffer)

  console.log(
    `[Model Loaded] ${modelName} (${(buffer.length / 1024 / 1024).toFixed(2)}MB) from ${resolvedPath}`
  )

  return buffer
}

/**
 * List available models (for admin purposes, cached)
 */
const modelListCache: { timestamp: number; models: string[] } = {
  timestamp: 0,
  models: [],
}
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export async function listAvailableModels(): Promise<string[]> {
  const now = Date.now()

  // Return cached list if still fresh
  if (now - modelListCache.timestamp < CACHE_TTL && modelListCache.models.length > 0) {
    return modelListCache.models
  }

  if (!fs.existsSync(PRIVATE_MODELS_DIR)) {
    return []
  }

  const files = fs.readdirSync(PRIVATE_MODELS_DIR)
  const models = files.filter((file) => file.endsWith(".wasm") || file.endsWith(".onnx"))

  modelListCache.timestamp = now
  modelListCache.models = models

  return models
}

/**
 * Get model metadata for CDN caching strategies
 */
export async function getModelMetadata(modelName: string) {
  const modelPath = path.join(PRIVATE_MODELS_DIR, modelName)
  
  if (!fs.existsSync(modelPath)) {
    return null
  }

  const stats = fs.statSync(modelPath)
  
  return {
    name: modelName,
    size: stats.size,
    lastModified: stats.mtime,
    sizeInMB: (stats.size / 1024 / 1024).toFixed(2),
  }
}

/**
 * Check if model cache is stale (for ISR/revalidation)
 */
export async function isModelCacheStale(lastFetch: number): Promise<boolean> {
  const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days
  return Date.now() - lastFetch > CACHE_DURATION
}
