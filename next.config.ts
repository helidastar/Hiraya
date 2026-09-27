import type { NextConfig } from "next";

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Tasks became Hopes; keep old links working
  async redirects() {
    return [{ source: '/dashboard/task', destination: '/dashboard/hopes', permanent: false }];
  },
  images: {
    remotePatterns: supabaseHost ? [{ protocol: 'https', hostname: supabaseHost }] : [],
  },
};

export default nextConfig;
