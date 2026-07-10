import Link from 'next/link'
import type {
  DashboardActivityItem,
  DashboardActivityType,
} from '@/lib/dashboard/getDashboardActivity'
import { DashboardPanel } from '../Shared/DashboardPanel'

function getActivityLabel(type: DashboardActivityType) {
  if (type === 'property') return 'Property'
  if (type === 'lead') return 'Valuation'
  if (type === 'enquiry') return 'Enquiry'
  if (type === 'agent') return 'Agent'

  return 'Activity'
}

function formatActivityDate(date: string) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function DashboardActivityFeed({ activities }: { activities: DashboardActivityItem[] }) {
  return (
    <DashboardPanel title="Recent Activity">
      {activities.length > 0 ? (
        <div className="divide-y divide-black/10">
          {activities.map((activity) => (
            <Link
              key={activity.id}
              href={activity.href}
              className="grid gap-2 py-4 transition first:pt-0 last:pb-0 hover:text-black/60"
            >
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs uppercase tracking-[0.2em] text-black/40">
                  {getActivityLabel(activity.type)}
                </p>

                <time className="text-xs text-black/40">{formatActivityDate(activity.date)}</time>
              </div>

              <p className="font-medium">{activity.title}</p>

              <p className="text-sm text-black/60">{activity.description}</p>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-sm text-black/60">No recent activity.</p>
      )}
    </DashboardPanel>
  )
}
