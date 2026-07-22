import Link from 'next/link'

import type { DashboardLead } from '@/lib/dashboard/getDashboardLeads'
import { DashboardPanel } from '../Shared/DashboardPanel'

function formatEstimatedValue(value: number | null) {
  if (!value) return 'Value not provided'

  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatRelativeDate(date: string) {
  const createdAt = new Date(date)
  const now = new Date()
  const differenceMs = now.getTime() - createdAt.getTime()
  const differenceMinutes = Math.max(0, Math.floor(differenceMs / 60_000))

  if (differenceMinutes < 1) return 'Just now'
  if (differenceMinutes < 60) return `${differenceMinutes} min ago`

  const differenceHours = Math.floor(differenceMinutes / 60)

  if (differenceHours < 24) {
    return `${differenceHours} ${differenceHours === 1 ? 'hour' : 'hours'} ago`
  }

  const differenceDays = Math.floor(differenceHours / 24)

  if (differenceDays < 7) {
    return `${differenceDays} ${differenceDays === 1 ? 'day' : 'days'} ago`
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
  }).format(createdAt)
}

function formatStatus(status: string) {
  return status.replaceAll('-', ' ')
}

function getStatusClasses(status: string) {
  if (status === 'new') {
    return 'bg-amber-100 text-amber-800'
  }

  if (status === 'instruction-won') {
    return 'bg-emerald-100 text-emerald-800'
  }

  if (status === 'lost') {
    return 'bg-red-100 text-red-800'
  }

  return 'bg-neutral-100 text-neutral-700'
}

export function DashboardRecentLeads({ leads }: { leads: DashboardLead[] }) {
  return (
    <DashboardPanel title="Recent Leads">
      {leads.length > 0 ? (
        <div className="divide-y divide-black/10">
          {leads.map((lead) => (
            <Link
              key={lead.id}
              href={`/dashboard/leads/${lead.id}`}
              className="block py-4 transition first:pt-0 last:pb-0 hover:text-black/60"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="truncate font-medium text-black">{lead.name}</p>

                  <p className="mt-1 truncate text-sm text-black/55">
                    {formatEstimatedValue(lead.estimatedValue)}
                    {lead.propertyType ? ` • ${lead.propertyType}` : ''}
                    {lead.postcode ? ` • ${lead.postcode}` : ''}
                  </p>
                </div>

                <span
                  className={`shrink-0 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${getStatusClasses(
                    lead.status,
                  )}`}
                >
                  {formatStatus(lead.status)}
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between gap-4">
                <p className="text-xs text-black/40">{lead.email}</p>

                <time className="shrink-0 text-xs text-black/40">
                  {formatRelativeDate(lead.createdAt)}
                </time>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="py-2">
          <p className="text-sm font-medium">No valuation leads yet.</p>

          <p className="mt-1 text-sm leading-6 text-black/50">
            New seller enquiries will appear here.
          </p>
        </div>
      )}

      <div className="mt-5 border-t border-black/10 pt-4">
        <Link
          href="/dashboard/leads"
          className="text-xs font-semibold uppercase tracking-[0.14em] text-black/60 transition hover:text-black"
        >
          View all leads →
        </Link>
      </div>
    </DashboardPanel>
  )
}
