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
  metadata?: unknown
  isLast?: boolean
  compact?: boolean
}

type ActivityMetadata = {
  priority?: unknown
}

function formatActivityTime(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Time unavailable'
  }

  const now = new Date()
  const differenceInMilliseconds = now.getTime() - date.getTime()
  const differenceInMinutes = Math.floor(differenceInMilliseconds / (1000 * 60))

  if (differenceInMinutes >= 0 && differenceInMinutes < 1) {
    return 'Just now'
  }

  if (differenceInMinutes >= 1 && differenceInMinutes < 60) {
    return `${differenceInMinutes} min ago`
  }

  if (differenceInMinutes >= 60 && differenceInMinutes < 24 * 60) {
    const hours = Math.floor(differenceInMinutes / 60)

    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`
  }

  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function formatActivityDateTime(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Date unavailable'
  }

  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function formatEntityType(value: ActivityEntityType) {
  return value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function formatPriority(value: string) {
  return value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function getPriority(metadata: unknown) {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return null
  }

  const priority = (metadata as ActivityMetadata).priority

  if (priority !== 'low' && priority !== 'normal' && priority !== 'high' && priority !== 'urgent') {
    return null
  }

  return priority
}

function getPriorityClassName(priority: string) {
  switch (priority) {
    case 'urgent':
      return 'border-red-200 bg-red-50 text-red-700'

    case 'high':
      return 'border-amber-200 bg-amber-50 text-amber-700'

    case 'low':
      return 'border-neutral-200 bg-neutral-50 text-neutral-500'

    default:
      return 'border-neutral-200 bg-white text-neutral-600'
  }
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

function formatDescription(description: string | null | undefined) {
  if (!description) {
    return null
  }

  const taskCreatedMatch = description.match(/^Task created:\s*(.+)\.$/i)

  if (taskCreatedMatch) {
    return `Created task “${taskCreatedMatch[1]}”.`
  }

  const propertyPriceMatch = description.match(
    /^Property price changed from\s+(.+)\s+to\s+(.+)\.$/i,
  )

  if (propertyPriceMatch) {
    return `Asking price changed from ${propertyPriceMatch[1]} to ${propertyPriceMatch[2]}.`
  }

  return description
}

export function TimelineItem({
  title,
  description,
  createdAt,
  userName,
  entityType,
  relation,
  severity,
  metadata,
  isLast = false,
  compact = false,
}: TimelineItemProps) {
  const entityLabel = relation?.subtitle || formatEntityType(entityType)
  const priority = entityType === ActivityEntityTypes.TASK ? getPriority(metadata) : null
  const formattedDescription = formatDescription(description)

  return (
    <div
      className={[
        'relative grid grid-cols-[20px_minmax(0,1fr)] gap-4 last:pb-0',
        compact ? 'pb-5' : 'pb-8',
      ].join(' ')}
    >
      <div className="relative flex justify-center">
        <span
          className={[
            'relative z-10 rounded-full',
            compact ? 'mt-1.5 h-2 w-2' : 'mt-1.5 h-2.5 w-2.5',
            getDotClassName(severity),
          ].join(' ')}
        />

        {!isLast ? (
          <span
            className={[
              'absolute bottom-0 left-1/2 w-px -translate-x-1/2 bg-neutral-200',
              compact ? 'top-3.5' : 'top-4',
            ].join(' ')}
          />
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

              {priority ? (
                <span
                  className={[
                    'rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em]',
                    getPriorityClassName(priority),
                  ].join(' ')}
                >
                  {formatPriority(priority)}
                </span>
              ) : null}
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

        {relation?.title ? (
          <p
            className={[
              'font-medium text-neutral-800',
              compact ? 'mt-1 text-xs' : 'mt-2 text-sm',
            ].join(' ')}
          >
            {relation.title}
          </p>
        ) : null}

        {formattedDescription ? (
          <p
            className={[
              'text-neutral-600',
              compact ? 'mt-1 text-sm leading-5' : 'mt-2 text-sm leading-6',
            ].join(' ')}
          >
            {formattedDescription}
          </p>
        ) : null}

        {!compact && (userName || relation?.href) ? (
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
            {userName ? <p className="text-xs text-neutral-500">{userName}</p> : null}

            {relation?.href ? (
              <Link
                href={relation.href}
                className="text-xs font-semibold text-neutral-950 underline-offset-4 hover:underline"
              >
                Open {entityLabel.toLowerCase()} →
              </Link>
            ) : null}
          </div>
        ) : null}

        {compact && relation?.href ? (
          <Link
            href={relation.href}
            className="mt-2 inline-flex text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-700 underline-offset-4 hover:text-neutral-950 hover:underline"
          >
            Open {entityLabel.toLowerCase()} →
          </Link>
        ) : null}
      </div>
    </div>
  )
}
