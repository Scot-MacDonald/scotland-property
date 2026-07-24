import { Timeline } from '@/components/DashboardV2/Timeline'
import { ActivityEntityTypes } from '@/lib/activity'

type TaskHistoryTabProps = {
  taskId: string
}

export async function TaskHistoryTab({ taskId }: TaskHistoryTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-neutral-950">Activity History</h2>

        <p className="mt-1 text-sm text-neutral-500">
          Every significant change made to this task is recorded here.
        </p>
      </div>

      <Timeline entityType={ActivityEntityTypes.TASK} entityId={taskId} />
    </div>
  )
}
