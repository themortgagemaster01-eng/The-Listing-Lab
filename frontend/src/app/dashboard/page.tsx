import type { Metadata } from "next";

import { DashboardTopbar } from "@/components/layout/dashboard-topbar";
import { MobileHeader } from "@/components/layout/mobile-header";
import { StatsRow } from "@/components/dashboard/stats-row";
import { RecentPropertyLabs } from "@/components/dashboard/recent-property-labs";
import { AiAssistantPanel } from "@/components/dashboard/ai-assistant-panel";
import { UpcomingPanel } from "@/components/dashboard/upcoming-panel";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { currentUser } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Dashboard | Listing Lab",
};

const SUBTITLE = "Here's what's happening with your Property Labs today.";

export default function DashboardPage() {
  const firstName = currentUser.name.split(" ")[0];

  return (
    <div className="animate-fade-slide-in space-y-8">
      <DashboardTopbar name={firstName} subtitle={SUBTITLE} />
      <MobileHeader name={firstName} subtitle={SUBTITLE} />

      <StatsRow />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-start lg:gap-8">
        <div className="order-1 lg:col-span-2 lg:col-start-1 lg:row-start-1">
          <RecentPropertyLabs />
        </div>

        <div className="order-2 lg:col-start-3 lg:row-start-1">
          <AiAssistantPanel />
        </div>

        <div className="order-3 lg:col-start-3 lg:row-start-2">
          <UpcomingPanel />
        </div>

        <div className="order-4 lg:col-span-2 lg:col-start-1 lg:row-start-2">
          <QuickActions />
        </div>

        <div className="order-5 lg:col-span-2 lg:col-start-1 lg:row-start-3">
          <RecentActivity />
        </div>
      </div>
    </div>
  );
}
