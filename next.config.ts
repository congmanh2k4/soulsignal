import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {
    // Force project root to this folder to silence multi-lockfile warning
    root: __dirname,
  },
};

export default nextConfig;
