"use client";

import * as React from "react";
import { Send, Sparkles } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/shared/Toast";
import { currentUser } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export interface ChatMessage {
  id: string;
  from: "user" | "ai";
  text: string;
}

interface AIChatPanelProps {
  messages: ChatMessage[];
  placeholder?: string;
  comingSoonMessage?: string;
  className?: string;
}

/**
 * Reusable chat-bubble UI: message list + input. Extracted from what used
 * to be the AI Assistant tab's inline markup so the same pattern can power
 * the property-scoped "AI Chat" tab and, later, `AICommandWidget`. The
 * input is live (not disabled) but doesn't have a real backend yet —
 * submitting shows an on-brand toast instead of doing nothing.
 */
export function AIChatPanel({
  messages,
  placeholder = "Ask about this property…",
  comingSoonMessage = "Live AI chat is coming soon.",
  className,
}: AIChatPanelProps) {
  const { showToast } = useToast();
  const [draft, setDraft] = React.useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.trim()) return;
    showToast(comingSoonMessage);
    setDraft("");
  }

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="space-y-4">
        {messages.map((message) =>
          message.from === "ai" ? (
            <div key={message.id} className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gold-400 to-gold-600 text-white">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-muted px-4 py-3 text-sm text-foreground">
                {message.text}
              </div>
            </div>
          ) : (
            <div key={message.id} className="flex items-start justify-end gap-3">
              <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-navy-950 px-4 py-3 text-sm text-white dark:bg-navy-800">
                {message.text}
              </div>
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
                <AvatarFallback>RC</AvatarFallback>
              </Avatar>
            </div>
          )
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 rounded-2xl border border-dashed border-border bg-background px-4 py-3"
      >
        <input
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={placeholder}
          className="h-full flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
        <button
          type="submit"
          aria-label="Send message"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
