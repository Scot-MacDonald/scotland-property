import { WorkspacePanel, WorkspaceTimeline } from '@/components/DashboardV2/Workspace'

type HistoryTabProps = {
  createdAt: string
  updatedAt: string
}

export function HistoryTab({ createdAt, updatedAt }: HistoryTabProps) {
  return (
    <WorkspacePanel title="History" description="Recent activity for this property.">
      <WorkspaceTimeline
        items={[
          {
            id: 'updated',
            title: 'Property last updated',
            date: updatedAt,
            description: 'The property record was changed.',
          },
          {
            id: 'created',
            title: 'Property created',
            date: createdAt,
            description: 'The property listing was created.',
          },
        ]}
      />
    </WorkspacePanel>
  )
}
