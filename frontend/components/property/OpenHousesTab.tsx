"use client";

import { Clock, MapPin, Plus, Printer, Users } from "lucide-react";

import { DashboardCard } from "@/components/shared/DashboardCard";
import { ComingSoonButton } from "@/components/property/ComingSoonButton";
import { Button } from "@/components/ui/button";
import type { Property } from "@/types";

interface OpenHouseEvent {
  id: string;
  day: string;
  month: string;
  weekday: string;
  time: string;
  hostNote: string;
}

function buildOpenHouses(): OpenHouseEvent[] {
  return [
    { id: "oh-1", day: "22", month: "MAY", weekday: "Saturday", time: "12:00 – 3:00 PM", hostNote: "Broker's open — light refreshments." },
    { id: "oh-2", day: "23", month: "MAY", weekday: "Sunday", time: "1:00 – 4:00 PM", hostNote: "Public open house." },
    { id: "oh-3", day: "29", month: "MAY", weekday: "Saturday", time: "11:00 AM – 1:00 PM", hostNote: "Follow-up weekend showing." },
  ];
}

interface OpenHousesTabProps {
  property: Property;
}

/**
 * Open Houses tab — new. Styled mock: a list of scheduled events for this
 * property, a "Schedule Open House" affordance, and a "Generate Sign-In
 * Sheet" card (styled, non-functional beyond UI — same placeholder-tier
 * polish as the rest of the workspace).
 */
export function OpenHousesTab({ property }: OpenHousesTabProps) {
  const events = buildOpenHouses();

  return (
    <div className="space-y-6">
      <DashboardCard title="Upcoming Open Houses" action={{ label: `${events.length} scheduled` }}>
        <div className="space-y-3">
          {events.map((event) => (
            <div key={event.id} className="flex items-center gap-4 rounded-2xl border border-border bg-background p-4">
              <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-muted text-navy-800 dark:text-white">
                <span className="text-[10px] font-semibold uppercase leading-none text-muted-foreground">
                  {event.month}
                </span>
                <span className="text-lg font-bold leading-tight">{event.day}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">{event.weekday} Open House</p>
                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {event.time}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {property.address}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{event.hostNote}</p>
              </div>
            </div>
          ))}
        </div>

        <Button type="button" variant="gold" size="lg" className="mt-5">
          <Plus className="h-4 w-4" />
          Schedule Open House
        </Button>
      </DashboardCard>

      <DashboardCard title="Sign-In Sheet">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-100 text-gold-600 dark:bg-gold-500/15 dark:text-gold-400">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Printable visitor sign-in sheet</p>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Generate a branded sign-in sheet with {property.address} pre-filled, ready to print for
                your next open house.
              </p>
            </div>
          </div>
          <ComingSoonButton variant="outline" icon={Printer} message="Sign-in sheet generation is coming soon">
            Generate Sign-In Sheet
          </ComingSoonButton>
        </div>
      </DashboardCard>
    </div>
  );
}
