type TimelineItemProps = {
  title: string
  description?: string | null
  createdAt: string
  userName?: string | null
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

export function TimelineItem({
  title,
  description,
  createdAt,
  userName,
  isLast = false,
}: TimelineItemProps) {
  return (
    <div className="relative grid grid-cols-[20px_minmax(0,1fr)] gap-4 pb-8 last:pb-0">
      <div className="relative flex justify-center">
        <span className="relative z-10 mt-1.5 h-2.5 w-2.5 rounded-full bg-neutral-950" />

        {!isLast ? (
          <span className="absolute left-1/2 top-4 bottom-0 w-px -translate-x-1/2 bg-neutral-200" />
        ) : null}
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-1">
          <h3 className="text-sm font-semibold text-neutral-950">{title}</h3>

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

        {userName ? <p className="mt-3 text-xs text-neutral-500">{userName}</p> : null}
      </div>
    </div>
  )
}
