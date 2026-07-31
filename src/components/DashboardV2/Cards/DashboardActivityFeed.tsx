import type { DashboardActivityResult } from '@/lib/dashboard/getDashboardActivity'

import { TimelineView } from '../Timeline/TimelineView'
import { DashboardPanel } from '../Shared/DashboardPanel'

type DashboardActivityFeedProps = {
  activities: DashboardActivityResult
}

export function DashboardActivityFeed({ activities }: DashboardActivityFeedProps) {
  return (
    <DashboardPanel title="Latest updates">
      <TimelineView
        activities={activities.activities}
        relationMap={activities.relationMap}
        compact
        emptyTitle="No recent activity"
        emptyDescription="New agency activity will appear here."
      />
    </DashboardPanel>
  )
}
