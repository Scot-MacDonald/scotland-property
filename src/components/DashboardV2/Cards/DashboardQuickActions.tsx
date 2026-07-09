import Link from 'next/link'
import { DashboardPanel } from '../Shared/DashboardPanel'

const actions = [
  { label: '+ Property', href: '/dashboard/properties/new' },
  { label: '+ Agent', href: '/dashboard/agents/new' },
  { label: 'Review Leads', href: '/dashboard/leads' },
  { label: 'CRM Imports', href: '/dashboard/imports' },
]

export function DashboardQuickActions() {
  return (
    <DashboardPanel title="Quick Actions">
      <div className="grid gap-2">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="border border-black/10 px-4 py-3 text-sm transition hover:bg-black hover:text-white"
          >
            {action.label}
          </Link>
        ))}
      </div>
    </DashboardPanel>
  )
}
