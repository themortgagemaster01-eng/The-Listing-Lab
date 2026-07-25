import { ActivityFeed } from "@/components/shared/ActivityFeed";
import { getPropertyActivity } from "@/lib/mock-data";
import type { Property } from "@/types";

interface ActivityTimelineTabProps {
  property: Property;
}

/**
 * Activity Timeline tab — new. Property-scoped activity feed (via the
 * shared, generalized `ActivityFeed` component) with mock entries specific
 * to this property.
 */
export function ActivityTimelineTab({ property }: ActivityTimelineTabProps) {
  const items = getPropertyActivity(property);

  return (
    <div className="space-y-6">
      <ActivityFeed
        items={items}
        title={`Activity Timeline · ${property.address}`}
        emptyMessage={`No activity recorded for ${property.address} yet.`}
      />
    </div>
  );
}
