/** @type {import('next').NextConfig} */

// Derives the Supabase Storage hostname from NEXT_PUBLIC_SUPABASE_URL (when
// set) so `next/image` can optimize real property/agent photos uploaded to
// Supabase Storage — added for the public Listing Presentation Site
// (`src/app/site/[slug]/page.tsx`), which has a hard Lighthouse Performance
// requirement and therefore uses `next/image` (not a plain `<img>`, unlike
// a few older components elsewhere in the app) for every photo. Guarded so
// a missing/invalid env var never breaks the build — falls back to just the
// two static hosts below (data: URLs bypass remotePatterns entirely and
// always work regardless).
let supabaseStorageHost;
try {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  supabaseStorageHost = supabaseUrl ? new URL(supabaseUrl).hostname : undefined;
} catch {
  supabaseStorageHost = undefined;
}

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
      ...(supabaseStorageHost
        ? [
            {
              protocol: "https",
              hostname: supabaseStorageHost,
            },
          ]
        : []),
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
