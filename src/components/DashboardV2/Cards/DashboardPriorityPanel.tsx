import { DashboardPanel } from '../Shared/DashboardPanel'

export function DashboardPriorityPanel() {
  return (
    <DashboardPanel title="Today’s Priorities">
      <div className="grid gap-3 text-sm text-black/60">
        <p>🔴 3 buyer enquiries need replies</p>
        <p>🟡 2 valuation follow-ups due</p>
        <p>🟢 CRM import completed</p>
      </div>
    </DashboardPanel>
  )
}
