import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PGlite (in-memory Postgres for e2e, see lib/db.ts) ships WASM; load it from node_modules.
  serverExternalPackages: ["@electric-sql/pglite"],
  // Lint runs once, in its own step (pre-commit hook and CI), not again inside every build.
  eslint: { ignoreDuringBuilds: true },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/barnwell-family-tree",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
