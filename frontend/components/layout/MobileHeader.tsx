"use client";

import * as React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Logo } from "@/components/Logo";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { currentUser } from "@/lib/mock-data";
import { getGreeting } from "@/lib/utils";

interface MobileHeaderProps {
  name: string;
  subtitle: string;
}

/**
 * Compact header shown below the `lg` breakpoint: icon logo, bell, theme
 * toggle, avatar, greeting. The AI command bar hero renders separately,
 * directly below this header, so it stays prominent on mobile too.
 */
export function MobileHeader({ name, subtitle }: MobileHeaderProps) {
  const [greeting, setGreeting] = React.useState("Good morning");

  React.useEffect(() => {
    setGreeting(getGreeting(new Date().getHours()));
  }, []);

  return (
    <div className="lg:hidden">
      <div className="flex items-center justify-between">
        <Logo variant="compact" />
        <div className="flex items-center gap-2">
          <NotificationBell />
          <ThemeToggle />
          <Avatar className="h-9 w-9">
            <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
            <AvatarFallback>RC</AvatarFallback>
          </Avatar>
        </div>
      </div>

      <div className="mt-5">
        <h1 className="text-2xl font-bold tracking-tight text-navy-800 dark:text-white">
          {greeting}, {name}! <span aria-hidden="true">👋</span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}
