"use client";

import * as React from "react";
import { NotebookPen, Plus } from "lucide-react";

import { DashboardCard } from "@/components/shared/DashboardCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import type { Property } from "@/types";

interface Note {
  id: string;
  text: string;
  timestamp: string;
}

function seedNotes(property: Property): Note[] {
  return [
    {
      id: "note-1",
      text: `Seller mentioned they'd consider a rent-back for up to 2 weeks after closing at ${property.address}.`,
      timestamp: "2 days ago",
    },
    {
      id: "note-2",
      text: "Buyer's pre-approval came back at $50K over asking — worth mentioning in the next round of showings.",
      timestamp: "5 days ago",
    },
    {
      id: "note-3",
      text: "Schedule the professional photographer before the open house this weekend.",
      timestamp: "1 week ago",
    },
  ];
}

interface NotesTabProps {
  property: Property;
}

export function NotesTab({ property }: NotesTabProps) {
  const [notes, setNotes] = React.useState<Note[]>(() => seedNotes(property));
  const [draft, setDraft] = React.useState("");

  function handleAddNote() {
    const trimmed = draft.trim();
    if (!trimmed) return;
    setNotes((prev) => [{ id: `note-${Date.now()}`, text: trimmed, timestamp: "Just now" }, ...prev]);
    setDraft("");
  }

  return (
    <div className="space-y-6">
      <DashboardCard title="Notes" action={{ label: `${notes.length} notes` }}>
        <div className="space-y-3">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={`Add a note about ${property.address}…`}
            rows={3}
            className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold-400"
          />
          <div className="flex justify-end">
            <Button type="button" size="sm" onClick={handleAddNote} disabled={!draft.trim()}>
              <Plus className="h-4 w-4" />
              Add Note
            </Button>
          </div>
        </div>

        <div className="mt-5 space-y-3 border-t border-border pt-5">
          {notes.length === 0 && (
            <EmptyState
              icon={NotebookPen}
              title="No notes yet"
              description="Add the first note about this property above."
              className="border-0 bg-transparent py-6"
            />
          )}
          {notes.map((note) => (
            <div key={note.id} className="flex items-start gap-3 rounded-xl border border-border bg-background p-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold-100 text-gold-600 dark:bg-gold-500/15 dark:text-gold-400">
                <NotebookPen className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-foreground">{note.text}</p>
                <p className="mt-1 text-xs text-muted-foreground">{note.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      </DashboardCard>
    </div>
  );
}
