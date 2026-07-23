import Link from 'next/link'

import type { DashboardViewing } from '@/lib/dashboard/getDashboardViewings'
import { DashboardPanel } from '../Shared/DashboardPanel'

function formatViewingTime(dateTime: string) {
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateTime))
}

function formatStatus(status: string) {
  return status.replaceAll('-', ' ')
}

function getStatusClasses(status: string) {
  if (status === 'confirmed') {
    return 'bg-emerald-100 text-emerald-800'
  }

  if (status === 'completed') {
    return 'bg-blue-100 text-blue-800'
  }

  if (status === 'cancelled' || status === 'no-show') {
    return 'bg-red-100 text-red-800'
  }

  return 'bg-neutral-100 text-neutral-700'
}

export function DashboardTodayViewings({ viewings }: { viewings: DashboardViewing[] }) {
  return (
    <DashboardPanel title="Today’s Viewings">
      {viewings.length > 0 ? (
        <div className="divide-y divide-black/10">
          {viewings.map((viewing) => (
            <Link
              key={viewing.id}
              href={`/dashboard/viewings/${viewing.id}`}
              className="grid grid-cols-[64px_minmax(0,1fr)] gap-4 py-4 transition first:pt-0 last:pb-0 hover:text-black/60"
            >
              <div>
                <p className="text-lg font-medium tracking-tight">
                  {formatViewingTime(viewing.dateTime)}
                </p>

                <p className="mt-1 text-xs text-black/40">{viewing.durationMinutes} min</p>
              </div>

              <div className="min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{viewing.propertyTitle}</p>

                    <p className="mt-1 truncate text-sm text-black/55">
                      {viewing.contactName}
                      {viewing.agentName !== 'Unassigned' ? ` • ${viewing.agentName}` : ''}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${getStatusClasses(
                      viewing.status,
                    )}`}
                  >
                    {formatStatus(viewing.status)}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="py-2">
          <p className="text-sm font-medium">No viewings scheduled today.</p>

          <p className="mt-1 text-sm leading-6 text-black/50">
            Upcoming appointments will appear here.
          </p>
        </div>
      )}

      <div className="mt-5 border-t border-black/10 pt-4">
        <Link
          href="/dashboard/viewings"
          className="text-xs font-semibold uppercase tracking-[0.14em] text-black/60 transition hover:text-black"
        >
          View all viewings →
        </Link>
      </div>
    </DashboardPanel>
  )
}
