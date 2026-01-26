import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  experimental: {
    optimizePackageImports: ["@remixicon/react", "recharts", "framer-motion"],
  },
};

export default nextConfig;
