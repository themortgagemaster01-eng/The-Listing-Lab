/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  experimental: {
    // Next.js 14.2 still gates `instrumentation.ts` (`src/instrumentation.ts`
    // here) behind this flag — it runs the "log Supabase/OpenAI config
    // status once at server boot" check in that file. See
    // `src/instrumentation.ts` and `src/lib/config/env-status.ts`.
    instrumentationHook: true,
  },
};

export default nextConfig;
