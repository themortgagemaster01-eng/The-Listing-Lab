"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, LogOut, Settings, User } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/shared/Toast";
import { currentUser as mockUser } from "@/lib/mock-data";
import { getSupabaseClient } from "@/lib/supabase/client";
import { getInitials } from "@/lib/utils";
import type { AuthUserSummary } from "@/lib/supabase/session";

interface UserMenuProps {
  /**
   * Real signed-in user from `src/app/(app)/layout.tsx` -> `getAuthUser()`.
   * `null`/`undefined` falls back to the mock account (the unconfigured /
   * local-dev case — see `isSupabaseSessionConfigured`).
   */
  user?: AuthUserSummary | null;
}

/** Pinned sidebar footer: user avatar, name, role, and a real sign-out. */
export function UserMenu({ user }: UserMenuProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isSigningOut, setIsSigningOut] = React.useState(false);

  const displayName = user?.name || mockUser.name;
  const displaySubtitle = user?.roleLabel || mockUser.subtitle;
  const avatarUrl = user?.avatarUrl || mockUser.avatarUrl;
  const initials = getInitials(displayName);

  async function handleSignOut() {
    setIsSigningOut(true);
    const supabase = getSupabaseClient();
    await supabase?.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-left transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950"
        >
          <Avatar className="h-9 w-9">
            <AvatarImage src={avatarUrl} alt={displayName} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{displayName}</p>
            <p className="truncate text-xs text-navy-200/70">{displaySubtitle}</p>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-navy-200/60" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="top" className="w-56">
        <DropdownMenuItem onSelect={() => showToast("Profile settings are coming soon.")}>
          <User className="h-4 w-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => showToast("Account settings are coming soon.")}>
          <Settings className="h-4 w-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="text-red-500 focus:bg-red-50 dark:focus:bg-red-500/10"
        >
          <LogOut className="h-4 w-4" />
          {isSigningOut ? "Signing out…" : "Log out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
