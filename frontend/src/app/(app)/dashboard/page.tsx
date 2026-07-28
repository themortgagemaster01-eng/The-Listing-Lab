import type { Metadata } from "next";

import { TopNavigation } from "@/components/layout/TopNavigation";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { SearchCommandBar } from "@/components/layout/SearchCommandBar";
import { StatsRow } from "@/components/dashboard/StatsRow";
import { RecentPropertyLabs } from "@/components/dashboard/RecentPropertyLabs";
import { AICommandWidget } from "@/components/dashboard/AICommandWidget";
import { UpcomingPanel } from "@/components/dashboard/UpcomingPanel";
import { QuickActionsGrid } from "@/components/dashboard/QuickActionsGrid";
import { ActivityFeed } from "@/components/shared/ActivityFeed";
import { currentUser, recentActivity } from "@/lib/mock-data";
import { getAuthUser } from "@/lib/supabase/session";

export const metadata: Metadata = {
  title: "Dashboard | Realtor Toolbox",
};

const SUBTITLE = "Here's what's happening with your Property Labs today.";

export default async function DashboardPage() {
  // Real signed-in user when Supabase auth is configured (see
  // `src/lib/supabase/session.ts`); falls back to the mock account
  // otherwise — `(app)/layout.tsx` already redirected to `/login` in the
  // "configured but signed out" case, so reaching this line with `user ===
  // null` only happens in the unconfigured/local-dev case.
  const user = await getAuthUser();
  const firstName = (user?.name ?? currentUser.name).split(" ")[0];

  return (
    <div className="animate-fade-slide-in space-y-8">
      <TopNavigation name={firstName} subtitle={SUBTITLE} avatarUrl={user?.avatarUrl} />
      <MobileHeader name={firstName} subtitle={SUBTITLE} avatarUrl={user?.avatarUrl} />

      {/* AI command hero: the visual centerpiece of the dashboard. */}
      <SearchCommandBar />

      <StatsRow />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-start lg:gap-8">
        <div className="order-1 lg:col-span-2 lg:col-start-1 lg:row-start-1">
          <RecentPropertyLabs />
        </div>

        <div className="order-2 lg:col-start-3 lg:row-start-1">
          <AICommandWidget />
        </div>

        <div className="order-3 lg:col-start-3 lg:row-start-2">
          <UpcomingPanel />
        </div>

        <div className="order-4 lg:col-span-2 lg:col-start-1 lg:row-start-2">
          <QuickActionsGrid />
        </div>

        <div className="order-5 lg:col-span-2 lg:col-start-1 lg:row-start-3">
          <ActivityFeed items={recentActivity} title="Recent Activity" />
        </div>
      </div>
    </div>
  );
}
