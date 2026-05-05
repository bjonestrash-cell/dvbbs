import type { NextConfig } from "next";
import path from "node:path";

const commitSha =
  process.env.COMMIT_REF ?? // Netlify
  process.env.VERCEL_GIT_COMMIT_SHA ?? // Vercel
  process.env.GITHUB_SHA ?? // GitHub Actions
  "local";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  env: {
    NEXT_PUBLIC_COMMIT_SHA: commitSha.slice(0, 7),
  },
};

export default nextConfig;
