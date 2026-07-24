import Link from 'next/link'

import { DashboardBadge } from '../Shared/DashboardBadge'

type DashboardTaskCardProps = {
  title: string
  description?: string | null
  status: string
  priority: string
  dueDate: string
  dueState: 'overdue' | 'today' | 'upcoming' | 'none' | 'completed'
  assignedAgent: string
  relatedEntityType?: string | null
  relatedEntityTitle?: string | null
  relatedEntityHref?: string | null
  checklistCompleted: number
  checklistTotal: number
  href: string
}

function getStatusTone(status: string): 'neutral' | 'success' | 'warning' | 'danger' {
  if (status === 'completed') return 'success'
  if (status === 'waiting') return 'warning'
  if (status === 'cancelled') return 'danger'

  return 'neutral'
}

function getPriorityClasses(priority: string) {
  switch (priority) {
    case 'urgent':
      return 'border-red-200 bg-red-50 text-red-700'

    case 'high':
      return 'border-amber-200 bg-amber-50 text-amber-700'

    case 'low':
      return 'border-neutral-200 bg-neutral-50 text-neutral-500'

    default:
      return 'border-black/10 bg-white text-black/60'
  }
}

function getDueDateClasses(dueState: DashboardTaskCardProps['dueState']) {
  switch (dueState) {
    case 'overdue':
      return 'text-red-700'

    case 'today':
      return 'text-amber-700'

    case 'completed':
      return 'text-emerald-700'

    default:
      return 'text-black/60'
  }
}

function formatLabel(value: string) {
  return value
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function DashboardTaskCard({
  title,
  description,
  status,
  priority,
  dueDate,
  dueState,
  assignedAgent,
  relatedEntityType,
  relatedEntityTitle,
  relatedEntityHref,
  checklistCompleted,
  checklistTotal,
  href,
}: DashboardTaskCardProps) {
  return (
    <article className="border border-black/10 bg-white p-6 transition hover:border-black/25 hover:shadow-sm lg:p-7">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <DashboardBadge tone={getStatusTone(status)}>{formatLabel(status)}</DashboardBadge>

            <span
              className={[
                'inline-flex border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]',
                getPriorityClasses(priority),
              ].join(' ')}
            >
              {formatLabel(priority)} priority
            </span>
          </div>

          <h2 className="mt-5 text-2xl font-medium tracking-tight">
            <Link href={href} className="underline-offset-4 hover:underline">
              {title}
            </Link>
          </h2>

          {description ? (
            <p className="mt-3 max-w-3xl text-sm leading-6 text-black/60">{description}</p>
          ) : null}

          <div className="mt-6 grid gap-5 border-t border-black/10 pt-5 sm:grid-cols-2 xl:grid-cols-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/40">Due</p>

              <p className={['mt-2 text-sm font-medium', getDueDateClasses(dueState)].join(' ')}>
                {dueDate}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/40">
                Assigned agent
              </p>

              <p className="mt-2 text-sm text-black/70">{assignedAgent}</p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/40">
                Related record
              </p>

              {relatedEntityTitle ? (
                relatedEntityHref ? (
                  <Link
                    href={relatedEntityHref}
                    className="mt-2 inline-block text-sm font-medium text-black underline-offset-4 hover:underline"
                  >
                    {relatedEntityTitle}
                  </Link>
                ) : (
                  <p className="mt-2 text-sm text-black/70">{relatedEntityTitle}</p>
                )
              ) : (
                <p className="mt-2 text-sm text-black/40">None</p>
              )}

              {relatedEntityType ? (
                <p className="mt-1 text-xs capitalize text-black/40">
                  {formatLabel(relatedEntityType)}
                </p>
              ) : null}
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/40">
                Checklist
              </p>

              <p className="mt-2 text-sm text-black/70">
                {checklistTotal > 0
                  ? `${checklistCompleted} of ${checklistTotal} completed`
                  : 'No checklist'}
              </p>

              {checklistTotal > 0 ? (
                <div className="mt-3 h-1.5 overflow-hidden bg-black/10">
                  <div
                    className="h-full bg-black transition-all"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.round((checklistCompleted / checklistTotal) * 100),
                      )}%`,
                    }}
                  />
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="shrink-0">
          <Link
            href={href}
            className="inline-flex min-h-11 items-center justify-center bg-black px-5 text-sm text-white"
          >
            Open Task
          </Link>
        </div>
      </div>
    </article>
  )
}
