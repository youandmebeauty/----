# ONNX Model Migration Guide

## 📋 Overview

The ONNX models have been restructured from the public folder to a private, secure location to prevent unauthorized access and model theft.

## 🔄 Migration Steps

### 1. **Create Private Models Directory**

```bash
# Create the private models directory (outside public folder)
mkdir -p private-models
```

### 2. **Move Model Files**

Move all ONNX model files from `public/onnx-wasm/` to `private-models/`:

```bash
# Move ONNX runtime WASM files
mv public/onnx-wasm/*.wasm private-models/

# Or selectively:
# mv public/onnx-wasm/ort-wasm-simd-threaded.wasm private-models/
```

### 3. **Add to .gitignore**

```bash
# Add to .gitignore to prevent committing large model files
echo "private-models/" >> .gitignore
echo "public/onnx-wasm/" >> .gitignore
```

### 4. **Environment Configuration**

Create or update `.env.local`:

```env
# Path to private models directory
# If not set, defaults to: {project_root}/private-models
PRIVATE_MODELS_DIR=private-models
```

### 5. **Update Client Code**

Replace direct model imports with the secure API:

**Before (Insecure):**
```typescript
import ort from "onnxruntime-web"

// Loading from public folder - exposed!
ort.env.wasm.wasmPaths = "/onnx-wasm/"
```

**After (Secure):**
```typescript
import { loadModelFromSecureAPI } from "@/lib/client/secure-model-loader"

// Models loaded from secure API endpoint
const modelBuffer = await loadModelFromSecureAPI("your-model.onnx")
```

## 🔐 Security Features

✅ **Private Directory Storage** - Models not exposed in public folder  
✅ **API-Based Serving** - Controlled access through `/api/models` endpoint  
✅ **Rate Limiting** - 10 requests per minute per device  
✅ **Device Tracking** - Device ID for quota enforcement  
✅ **Cache Control** - Secure HTTP headers and 24-hour caching  
✅ **Path Traversal Protection** - Validates model names to prevent directory escape  
✅ **Client-Side Caching** - IndexedDB/Cache API for offline capability  

## 🚀 API Endpoint

### Request Model File

```
GET /api/models?model={modelName}
Headers:
  x-device-id: {deviceId} (optional, auto-generated if not provided)
```

### Response

- **200 OK**: Model file as ArrayBuffer
- **400 Bad Request**: Missing model name
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Error**: Server error loading model

## 📦 Production Deployment

### For Vercel:

```bash
# Build with private models included
# Ensure private-models/ is in .vercelignore if using monorepo
```

### For Self-Hosted:

```bash
# Include private-models directory in deployment package
# Set PRIVATE_MODELS_DIR environment variable to absolute path
PRIVATE_MODELS_DIR=/app/private-models
```

## 🧪 Testing

```typescript
// Test the secure model loader
import { loadModelFromSecureAPI } from "@/lib/client/secure-model-loader"

async function testModelLoading() {
  try {
    const model = await loadModelFromSecureAPI("ort-wasm-simd-threaded.wasm")
    console.log("✅ Model loaded successfully:", model.byteLength, "bytes")
  } catch (error) {
    console.error("❌ Failed to load model:", error)
  }
}
```

## 📊 Migration Checklist

- [ ] Create `private-models/` directory
- [ ] Move all `.wasm` files from `public/onnx-wasm/` to `private-models/`
- [ ] Update `.gitignore` to exclude model files
- [ ] Set `PRIVATE_MODELS_DIR` in `.env.local`
- [ ] Update client code to use `loadModelFromSecureAPI()`
- [ ] Test model loading in development
- [ ] Verify API endpoint is working: `curl http://localhost:3000/api/models?model=your-model.wasm`
- [ ] Remove old `public/onnx-wasm/` directory once verified

## 💡 Best Practices

1. **Git LFS**: For large models, use Git LFS to track binary files
2. **CDN**: Cache models on CDN for better performance
3. **Versioning**: Version your models (e.g., `model-v1.0.onnx`)
4. **Monitoring**: Track model loading errors and performance metrics
5. **Compression**: Consider GZIP compression for transfer optimization

## 🔗 References

- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [Web Cache API](https://developer.mozilla.org/en-US/docs/Web/API/Cache)
- [ONNX Runtime Web](https://onnxruntime.ai/docs/execution-providers/web-assembly.html)
