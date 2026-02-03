# Vercel Deployment Guide - ONNX Models

## 🚀 Vercel Configuration

### 1. **Set Environment Variables in Vercel Dashboard**

Go to your Vercel project → Settings → Environment Variables

Add:
```
PRIVATE_MODELS_DIR=/var/task/private-models
```

> **Note:** In Vercel's serverless environment, `/var/task` is the function's root directory.

### 2. **Create .vercelignore** (Optional)

If you have a monorepo or want to exclude certain files:

```bash
# .vercelignore
.git
.gitignore
node_modules
.next/cache
.env.local.example
ONNX_MODEL_MIGRATION.md
sync/
posts/
```

### 3. **Configure vercel.json** (Optional but Recommended)

Create `vercel.json` at project root:

```json
{
  "buildCommand": "pnpm run build",
  "outputDirectory": ".next",
  "env": {
    "PRIVATE_MODELS_DIR": "@private_models_dir"
  },
  "functions": {
    "app/api/**": {
      "memory": 1024,
      "maxDuration": 60
    }
  }
}
```

## 📦 Function Size Considerations

**Vercel Serverless Function Limits:**
- **Default:** 50MB
- **Pro:** 250MB
- **Enterprise:** Custom

**Model Files:**
- ONNX WASM files are typically 10-50MB each
- Make sure your total deployment stays under your plan's limit

### Check Function Size:
```bash
# After deployment, check Vercel dashboard:
# Project Settings → Functions → {api-function-name}
```

## 🔧 Deployment Steps

### Step 1: Include Models in Build

Ensure `private-models/` directory is included in your git repository:

```bash
# Create private-models directory
mkdir -p private-models

# Add a .gitkeep to track the directory
touch private-models/.gitkeep

# Commit the empty directory
git add private-models/.gitkeep
git commit -m "Add private-models directory for ONNX models"
```

### Step 2: Add Models (Locally First)

For development/local testing:
```bash
# Download or move your ONNX models to private-models/
# Example:
# cp path/to/your-model.wasm private-models/
```

> **Production Deployment Option:**
> Instead of committing large model files to git, you can:
> - Use Vercel's secrets for URLs to download models at build time
> - Use Git LFS for large files
> - Store models in a CDN and fetch them on first API call

### Step 3: Deploy to Vercel

```bash
# Push to your repository (GitHub/GitLab/Bitbucket)
git push origin main

# Vercel will automatically deploy
# Or manually deploy:
# vercel --prod
```

### Step 4: Verify Deployment

Test the model API endpoint:

```bash
curl https://your-project.vercel.app/api/models?model=your-model.wasm
```

Expected response: Binary WASM file data

## 🔄 Model Caching in Vercel

The updated model loader includes:

**In-Memory Cache:**
- Models are cached within a function instance
- Reduces file I/O on subsequent requests
- TTL: Lifetime of function instance (typically 15 minutes)

**HTTP Cache Headers:**
- `Cache-Control: public, max-age=86400, immutable`
- Vercel CDN caches responses for 24 hours
- Subsequent requests served from CDN edge

**Benefits:**
- First request: Load from disk (~50-200ms)
- Subsequent requests (same instance): In-memory (~1-5ms)
- CDN requests: Global edge cache (~50-100ms)

## 📊 Production Deployment Checklist

- [ ] Models in `private-models/` directory
- [ ] Set `PRIVATE_MODELS_DIR` environment variable in Vercel
- [ ] Test API endpoint in deployment
- [ ] Monitor function execution time
- [ ] Verify Cache-Control headers are being set
- [ ] Check Vercel dashboard for function size
- [ ] Set up monitoring/error tracking (Sentry, etc.)
- [ ] Test with actual YOLOv8 model loading

## 🚨 Troubleshooting

### Error: "Model file not found"

**Solution:**
```bash
# SSH into Vercel function (Pro/Enterprise only)
# Or redeploy with correct directory structure:
ls -la private-models/
# Should show your .wasm files
```

### Error: "Function exceeds size limit"

**Solution:**
- Use Git LFS for models: `git lfs track "*.wasm"`
- Or use CDN storage and download at build time
- Split large models into smaller chunks

### Slow Model Loading

**Solution:**
- Increase function memory in `vercel.json` (up to 3008MB)
- Use Vercel's Edge Functions (if using Next.js 13+)
- Pre-warm functions with scheduled cron jobs

### CORS Issues

**Add to API route:**
```typescript
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET",
  "Access-Control-Allow-Headers": "Content-Type",
}

// Add to response headers
```

## 💡 Advanced Options

### Option 1: Use Vercel Blob for Models

Store models in Vercel Blob Storage:

```typescript
import { put, get } from "@vercel/blob"

export async function uploadModelToBlob(file: File) {
  const blob = await put(file.name, file, { access: "public" })
  return blob.url
}

export async function loadModelFromBlob(modelUrl: string) {
  const response = await fetch(modelUrl)
  return response.arrayBuffer()
}
```

### Option 2: Use Vercel KV for Model Metadata

Cache model metadata in Vercel KV:

```typescript
import { kv } from "@vercel/kv"

export async function getCachedModelMetadata(modelName: string) {
  const cached = await kv.get(`model:${modelName}`)
  if (cached) return cached

  const metadata = await getModelMetadata(modelName)
  await kv.setex(`model:${modelName}`, 3600, JSON.stringify(metadata))
  return metadata
}
```

## 📈 Monitoring & Analytics

Add monitoring to track model loading:

```typescript
// In /api/models route
export async function GET(request: NextRequest) {
  const startTime = Date.now()

  try {
    // ... model loading logic ...

    const duration = Date.now() - startTime
    console.log(`Model served in ${duration}ms`)

    // Track metrics (e.g., with Axiom, DataDog)
    // analyticsClient.trackEvent("model_served", { duration })
  } catch (error) {
    // Error tracking
  }
}
```

## 🔗 Useful Resources

- [Vercel Deployment Docs](https://vercel.com/docs)
- [Vercel Functions Limits](https://vercel.com/docs/functions/limitations)
- [Vercel Environment Variables](https://vercel.com/docs/environment-variables)
- [Vercel KV Storage](https://vercel.com/docs/storage/vercel-kv)
- [Vercel Blob Storage](https://vercel.com/docs/storage/vercel-blob)
