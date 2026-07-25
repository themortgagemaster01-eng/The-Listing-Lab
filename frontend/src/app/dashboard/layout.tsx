import type { Metadata } from "next";

import { Sidebar } from "@/components/layout/sidebar";
import { MobileTabBar } from "@/components/layout/mobile-tab-bar";

export const metadata: Metadata = {
  title: "Dashboard | Listing Lab",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:pl-[272px]">
        <main className="mx-auto max-w-[1600px] px-4 pb-24 pt-6 sm:px-6 lg:px-10 lg:pb-12 lg:pt-8">
          {children}
        </main>
      </div>
      <MobileTabBar />
    </div>
  );
}
