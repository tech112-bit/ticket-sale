import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Avoid dev overlay cross-origin warnings when using 127.0.0.1 or localhost.
  allowedDevOrigins: ["http://localhost:3000", "http://127.0.0.1:3000"],
};

export default nextConfig;
