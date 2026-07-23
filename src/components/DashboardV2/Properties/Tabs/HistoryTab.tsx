import { Timeline } from '@/components/DashboardV2/Timeline'
import { ActivityEntityTypes } from '@/lib/activity'

type HistoryTabProps = {
  propertyId: string
}

export async function HistoryTab({ propertyId }: HistoryTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-neutral-950">Activity History</h2>

        <p className="mt-1 text-sm text-neutral-500">
          Every significant change made to this property is recorded here.
        </p>
      </div>

      <Timeline entityType={ActivityEntityTypes.PROPERTY} entityId={propertyId} />
    </div>
  )
}
