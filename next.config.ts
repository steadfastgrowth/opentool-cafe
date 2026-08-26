import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  turbopack: {
    root: path.resolve(__dirname),
  },
  allowedDevOrigins: [
    "opentool.cafe",
    "www.opentool.cafe",
    "jpcmini-1.tailb2813e.ts.net",
  ],
};

export default nextConfig;
