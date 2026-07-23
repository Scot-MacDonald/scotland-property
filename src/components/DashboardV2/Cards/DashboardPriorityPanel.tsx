import Link from 'next/link'

import type { DashboardPrioritySummary } from '@/lib/dashboard/getDashboardPriorities'
import { DashboardPanel } from '../Shared/DashboardPanel'

type PriorityItem = {
  label: string
  count: number
  href: string
  tone: 'urgent' | 'attention' | 'clear'
}

function getPriorityClasses(tone: PriorityItem['tone']) {
  if (tone === 'urgent') {
    return {
      dot: 'bg-red-500',
      count: 'text-red-700',
    }
  }

  if (tone === 'attention') {
    return {
      dot: 'bg-amber-500',
      count: 'text-amber-700',
    }
  }

  return {
    dot: 'bg-emerald-500',
    count: 'text-emerald-700',
  }
}

function getFollowUpLabel(count: number) {
  return count === 1 ? 'overdue follow-up' : 'overdue follow-ups'
}

function getViewingLabel(count: number) {
  return count === 1 ? 'viewing today' : 'viewings today'
}

function getEnquiryLabel(count: number) {
  return count === 1 ? 'new enquiry' : 'new enquiries'
}

export function DashboardPriorityPanel({ summary }: { summary: DashboardPrioritySummary }) {
  const priorities: PriorityItem[] = [
    {
      label:
        summary.overdueFollowUps > 0
          ? getFollowUpLabel(summary.overdueFollowUps)
          : 'No overdue follow-ups',
      count: summary.overdueFollowUps,
      href: '/dashboard/leads',
      tone: summary.overdueFollowUps > 0 ? 'urgent' : 'clear',
    },
    {
      label:
        summary.todayViewings > 0 ? getViewingLabel(summary.todayViewings) : 'No viewings today',
      count: summary.todayViewings,
      href: '/dashboard/viewings',
      tone: summary.todayViewings > 0 ? 'attention' : 'clear',
    },
    {
      label: summary.newEnquiries > 0 ? getEnquiryLabel(summary.newEnquiries) : 'No new enquiries',
      count: summary.newEnquiries,
      href: '/dashboard/enquiries',
      tone: summary.newEnquiries > 0 ? 'attention' : 'clear',
    },
  ]

  return (
    <DashboardPanel title="Today’s Priorities">
      <div className="divide-y divide-black/10">
        {priorities.map((priority) => {
          const classes = getPriorityClasses(priority.tone)

          return (
            <Link
              key={priority.href}
              href={priority.href}
              className="flex items-center gap-3 py-4 transition first:pt-0 last:pb-0 hover:text-black/60"
            >
              <span
                aria-hidden="true"
                className={`h-2.5 w-2.5 shrink-0 rounded-full ${classes.dot}`}
              />

              <span className="min-w-0 flex-1 text-sm text-black/65">
                {priority.count > 0 ? (
                  <>
                    <strong className={`font-semibold ${classes.count}`}>{priority.count}</strong>{' '}
                    {priority.label}
                  </>
                ) : (
                  priority.label
                )}
              </span>

              <span aria-hidden="true" className="text-sm text-black/30">
                →
              </span>
            </Link>
          )
        })}
      </div>
    </DashboardPanel>
  )
}
