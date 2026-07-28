import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";

import { ThemeProvider } from "@/context/theme-context";
import { ToastProvider } from "@/components/shared/Toast";

import "./globals.css";

// Boot-time Supabase/OpenAI config-status logging lives in
// `src/instrumentation.ts` (Next.js's dedicated "run once per server cold
// start" hook — see that file). Deliberately NOT duplicated here: Next.js
// production mode renders pages in separate worker processes with their
// own module cache, so a module-level call in a page/layout module logs
// once per worker (not once total) the first time each worker handles a
// request — confirmed while testing this feature. `instrumentation.ts`'s
// `register()` genuinely runs once per server bootstrap, so it alone is
// the correct place for this.

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Realtor Toolbox | AI-Powered Marketing for Realtors",
  description:
    "Realtor Toolbox helps real estate agents create AI-powered marketing materials, from flyers to virtual staging, in minutes.",
};

const themeInitScript = `
(function () {
  try {
    var stored = window.localStorage.getItem("listing-lab-theme");
    var theme = stored || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    }
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfairDisplay.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider>
          <ToastProvider>{children}</ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
