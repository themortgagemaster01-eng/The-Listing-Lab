import type { Metadata } from "next";

import { QrCodeStudio } from "@/components/qr/QrCodeStudio";

export const metadata: Metadata = {
  title: "QR Code Studio | Realtor Toolbox",
};

/**
 * Standalone QR generator — matches the sidebar's "QR Codes" nav item
 * (`href: "/dashboard/qr-codes"` in `src/lib/mock-data.ts`, previously a
 * dead link with no page behind it) and the dashboard Toolbox's
 * "QR Codes" tile under Property Marketing (previously `comingSoon: true`).
 * Lives in the `(app)` route group like every other signed-in page, so it
 * gets the shared shell (sidebar, auth gate) from `AppShell` for free.
 */
export default function QrCodesPage() {
  return <QrCodeStudio />;
}
