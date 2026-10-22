/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placeholder.svg",
      },
      {
        protocol: "https",
        hostname: "cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
    unoptimized: false,
  },

  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
  },

  // Empty turbopack config to silence warning
  turbopack: {},
outputFileTracingIncludes: {
  "/api/models": ["./private-models/**/*"],
},
  async headers() {
    return [
      {
        source: "/models/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/onnx-wasm/:path*",
        headers: [
          {
            key: "Content-Type",
            value: "application/wasm",
          },
        ],
      },
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
        ],
      },
    ];
  },


};

export default nextConfig;
