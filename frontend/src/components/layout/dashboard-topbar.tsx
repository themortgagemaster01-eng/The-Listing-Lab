"use client";

import * as React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CommandBar } from "@/components/layout/command-bar";
import { NotificationBell } from "@/components/layout/notification-bell";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { currentUser } from "@/lib/mock-data";
import { getGreeting } from "@/lib/utils";

interface DashboardTopbarProps {
  name: string;
  subtitle: string;
}

/** Desktop header row: greeting + subtitle on the left, AI command bar and quick actions on the right. */
export function DashboardTopbar({ name, subtitle }: DashboardTopbarProps) {
  const [greeting, setGreeting] = React.useState("Good morning");

  React.useEffect(() => {
    setGreeting(getGreeting(new Date().getHours()));
  }, []);

  return (
    <div className="hidden items-start justify-between gap-8 lg:flex">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-navy-800 dark:text-white">
          {greeting}, {name}! <span aria-hidden="true">👋</span>
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
      </div>

      <div className="flex w-full max-w-xl items-center gap-3">
        <CommandBar variant="desktop" />
        <NotificationBell />
        <ThemeToggle />
        <Avatar className="h-10 w-10">
          <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
          <AvatarFallback>RC</AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
}
