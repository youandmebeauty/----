/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ["placeholder.svg"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    unoptimized: true,
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
  },
  webpack: (config, { isServer }) => {
    // CRITICAL: Tell webpack to ignore onnxruntime-web completely on the server
    if (isServer) {
      config.externals.push('onnxruntime-web');
    }

    // For client-side, prevent webpack from trying to parse it
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };

      // CRITICAL: Externalize onnxruntime-web to prevent webpack from bundling it
      config.externals = config.externals || {};
      config.externals['onnxruntime-web'] = 'onnxruntime-web';
    }

    return config;
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
    ];
  },
};

export default nextConfig;