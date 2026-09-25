import path from "node:path";
import type { NextConfig } from "next";

// @rfin/shared is linked from rhserver/shared/rfin (the RFIN contract, shared
// with rhserver and the Expo app), so Turbopack's root must span the repo.
const root = path.resolve(__dirname, "../..");

const nextConfig: NextConfig = {
  transpilePackages: ["@rfin/shared"],
  turbopack: { root },
  outputFileTracingRoot: root,
};

export default nextConfig;
