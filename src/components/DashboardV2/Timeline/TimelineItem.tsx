import Link from 'next/link'

import {
  ActivityEntityTypes,
  type ActivityEntityType,
  type ActivityRelation,
  type ActivitySeverity,
} from '@/lib/activity'

type TimelineItemProps = {
  title: string
  description?: string | null
  createdAt: string
  userName?: string | null
  entityType: ActivityEntityType
  relation?: ActivityRelation
  severity?: ActivitySeverity | null
  isLast?: boolean
}

function formatActivityTime(value: string) {
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function formatActivityDateTime(value: string) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function formatEntityType(value: ActivityEntityType) {
  return value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function getDotClassName(severity?: ActivitySeverity | null) {
  switch (severity) {
    case 'success':
      return 'bg-emerald-600'

    case 'warning':
      return 'bg-amber-500'

    case 'error':
      return 'bg-red-600'

    default:
      return 'bg-neutral-950'
  }
}

export function TimelineItem({
  title,
  description,
  createdAt,
  userName,
  entityType,
  relation,
  severity,
  isLast = false,
}: TimelineItemProps) {
  const entityLabel = relation?.subtitle || formatEntityType(entityType)

  return (
    <div className="relative grid grid-cols-[20px_minmax(0,1fr)] gap-4 pb-8 last:pb-0">
      <div className="relative flex justify-center">
        <span
          className={`relative z-10 mt-1.5 h-2.5 w-2.5 rounded-full ${getDotClassName(severity)}`}
        />

        {!isLast ? (
          <span className="absolute bottom-0 left-1/2 top-4 w-px -translate-x-1/2 bg-neutral-200" />
        ) : null}
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-1">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-semibold text-neutral-950">{title}</h3>

              <span className="rounded-full border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
                {entityLabel}
              </span>
            </div>
          </div>

          <time
            dateTime={createdAt}
            title={formatActivityDateTime(createdAt)}
            className="shrink-0 text-xs text-neutral-500"
          >
            {formatActivityTime(createdAt)}
          </time>
        </div>

        {description ? (
          <p className="mt-2 text-sm leading-6 text-neutral-600">{description}</p>
        ) : null}

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
          {userName ? <p className="text-xs text-neutral-500">{userName}</p> : null}

          {relation?.href && entityType !== ActivityEntityTypes.PROPERTY ? (
            <Link
              href={relation.href}
              className="text-xs font-semibold text-neutral-950 underline-offset-4 hover:underline"
            >
              Open {entityLabel.toLowerCase()} →
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  )
}
