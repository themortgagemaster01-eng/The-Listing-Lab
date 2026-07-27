"use client";

import * as React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { currentUser } from "@/lib/mock-data";
import { getGreeting, getInitials } from "@/lib/utils";

interface TopNavigationProps {
  name: string;
  subtitle: string;
  /** Real signed-in user's avatar, when there is one. Falls back to the mock avatar. */
  avatarUrl?: string;
}

/**
 * Desktop header row: greeting + subtitle on the left, bell / theme toggle /
 * avatar on the right. The AI command bar lives in its own hero section
 * below this row (see `SearchCommandBar`) rather than squeezed in here.
 */
export function TopNavigation({ name, subtitle, avatarUrl }: TopNavigationProps) {
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

      <div className="flex shrink-0 items-center gap-3">
        <NotificationBell />
        <ThemeToggle />
        <Avatar className="h-10 w-10">
          <AvatarImage src={avatarUrl || currentUser.avatarUrl} alt={name} />
          <AvatarFallback>{getInitials(name)}</AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
}
