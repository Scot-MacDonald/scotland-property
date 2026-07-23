import { WorkspacePanel } from '@/components/DashboardV2/Workspace'

export function DocumentsTab() {
  return (
    <WorkspacePanel
      title="Documents"
      description="Store brochures, certificates, contracts and supporting files."
    >
      <p className="text-sm leading-7 text-neutral-600">
        No property documents have been added yet.
      </p>
    </WorkspacePanel>
  )
}
