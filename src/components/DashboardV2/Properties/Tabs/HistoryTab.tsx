import { WorkspacePanel } from '@/components/DashboardV2/Workspace'

type HistoryTabProps = {
  createdAt?: string | null
  updatedAt?: string | null
}

function formatDate(value: string | null | undefined) {
  if (!value) return '—'

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

export function HistoryTab({ createdAt, updatedAt }: HistoryTabProps) {
  return (
    <WorkspacePanel
      title="Property history"
      description="Track important changes and activity for this listing."
    >
      <div className="space-y-4">
        <div className="border-l-2 border-neutral-200 pl-4">
          <p className="text-sm font-medium text-neutral-950">Property updated</p>

          <p className="mt-1 text-sm text-neutral-500">{formatDate(updatedAt)}</p>
        </div>

        <div className="border-l-2 border-neutral-200 pl-4">
          <p className="text-sm font-medium text-neutral-950">Property created</p>

          <p className="mt-1 text-sm text-neutral-500">{formatDate(createdAt)}</p>
        </div>
      </div>
    </WorkspacePanel>
  )
}
