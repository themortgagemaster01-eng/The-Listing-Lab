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

export const metadata: Metadata = {
  title: "Dashboard | Listing Lab",
};

const SUBTITLE = "Here's what's happening with your Property Labs today.";

export default function DashboardPage() {
  const firstName = currentUser.name.split(" ")[0];

  return (
    <div className="animate-fade-slide-in space-y-8">
      <TopNavigation name={firstName} subtitle={SUBTITLE} />
      <MobileHeader name={firstName} subtitle={SUBTITLE} />

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
