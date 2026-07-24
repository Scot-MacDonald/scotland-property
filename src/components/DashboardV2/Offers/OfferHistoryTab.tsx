import { Timeline } from '@/components/DashboardV2/Timeline'
import { ActivityEntityTypes } from '@/lib/activity'

type OfferHistoryTabProps = {
  offerId: string
}

export async function OfferHistoryTab({ offerId }: OfferHistoryTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-neutral-950">Activity History</h2>

        <p className="mt-1 text-sm text-neutral-500">
          Every significant change to this offer and negotiation is recorded here.
        </p>
      </div>

      <Timeline entityType={ActivityEntityTypes.OFFER} entityId={offerId} />
    </div>
  )
}
