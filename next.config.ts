import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    outputFileTracingExcludes: {
      "*": ["./public/**/*"],
    },
  },
};

export default nextConfig;
