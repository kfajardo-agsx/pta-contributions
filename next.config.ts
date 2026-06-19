import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root so stray parent-dir lockfiles don't confuse
  // Next's file tracing on Vercel.
  outputFileTracingRoot: import.meta.dirname,
};

export default nextConfig;
