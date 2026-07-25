import { DashboardCard } from "@/components/shared/DashboardCard";
import { AIChatPanel, type ChatMessage } from "@/components/property/AIChatPanel";
import type { Property } from "@/types";

function buildConversation(property: Property): ChatMessage[] {
  return [
    {
      id: "m1",
      from: "user",
      text: "Write a description for the listing",
    },
    {
      id: "m2",
      from: "ai",
      text: `Here's a draft: "${property.headline ?? "A stunning place to call home"} — ${
        property.description ?? "This home offers thoughtful design and a warm, welcoming layout throughout."
      }" Want me to make it punchier, or tailor it for a specific platform like Instagram?`,
    },
    {
      id: "m3",
      from: "user",
      text: "Can you suggest a good open house time this weekend?",
    },
    {
      id: "m4",
      from: "ai",
      text: "Saturday from 12:00–3:00 PM tends to perform best for listings in this area — it avoids morning errands and early dinner plans. I've added a placeholder for it on your Open Houses tab!",
    },
  ];
}

interface AiChatTabProps {
  property: Property;
}

/** AI Chat tab: former AI Assistant tab content, refactored onto the reusable `AIChatPanel`. */
export function AiChatTab({ property }: AiChatTabProps) {
  const conversation = buildConversation(property);

  return (
    <div className="space-y-6">
      <DashboardCard title={`AI Chat · ${property.address}`} contentClassName="mt-4">
        <AIChatPanel messages={conversation} placeholder={`Ask about ${property.address}…`} />
      </DashboardCard>
    </div>
  );
}
