/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
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
    ];
  },

  async redirects() {
    return [
      // Redirection HTTP & www vers HTTPS sans www
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "www.youandme.tn",
          },
        ],
        destination: "https://youandme.tn/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "youandme.tn",
          },
        ],
        destination: "https://youandme.tn/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
