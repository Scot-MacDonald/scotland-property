import type { ReactNode } from 'react'

export type WorkspaceTimelineItem = {
  id: string
  title: string
  date: string
  description?: string
  icon?: ReactNode
}

type WorkspaceTimelineProps = {
  items: WorkspaceTimelineItem[]
  emptyMessage?: string
}

function formatTimelineDate(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function WorkspaceTimeline({
  items,
  emptyMessage = 'No activity has been recorded.',
}: WorkspaceTimelineProps) {
  if (items.length === 0) {
    return <p className="text-sm leading-7 text-neutral-600">{emptyMessage}</p>
  }

  return (
    <div className="space-y-0">
      {items.map((item, index) => {
        const isLast = index === items.length - 1

        return (
          <div key={item.id} className="grid grid-cols-[24px_minmax(0,1fr)] gap-4">
            <div className="flex flex-col items-center">
              <span className="relative z-10 flex h-6 w-6 items-center justify-center border border-neutral-950 bg-white text-xs text-neutral-950">
                {item.icon || '•'}
              </span>

              {!isLast ? <span className="min-h-12 w-px flex-1 bg-neutral-200" /> : null}
            </div>

            <div className={isLast ? 'pb-0' : 'pb-8'}>
              <p className="text-sm font-semibold text-neutral-950">{item.title}</p>

              {item.description ? (
                <p className="mt-1 text-sm leading-6 text-neutral-600">{item.description}</p>
              ) : null}

              <p className="mt-2 text-xs uppercase tracking-[0.14em] text-neutral-400">
                {formatTimelineDate(item.date)}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
