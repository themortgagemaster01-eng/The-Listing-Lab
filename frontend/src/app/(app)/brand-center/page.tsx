import type { Metadata } from "next";

import { BrandCenterForm } from "@/components/brand/BrandCenterForm";
import { currentUser } from "@/lib/mock-data";
import { getAuthUser } from "@/lib/supabase/session";

export const metadata: Metadata = {
  title: "Brand Center | Realtor Toolbox",
};

/**
 * Brand Center (V1) — persistent, account-level branding profile. Lives in
 * the `(app)` route group so it shares the signed-in shell (sidebar, auth
 * gate) like every other protected route. Not part of the future 3-category
 * Toolbox nav (Marketing / Mortgage & Buyer Tools / Business Growth) — per
 * Robert's positioning note, it's a persistent setup step surfaced from
 * onboarding and the Account nav section, not a toolbox tile.
 */
export default async function BrandCenterPage() {
  const user = await getAuthUser();
  const userName = user?.name ?? currentUser.name;

  return <BrandCenterForm userName={userName} />;
}
