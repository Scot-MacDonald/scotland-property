import Link from 'next/link'
import type { ReactNode } from 'react'

type WorkspaceHeaderProps = {
  title: string
  eyebrow?: string
  status?: ReactNode
  backHref: string
  backLabel: string
  actions?: ReactNode
}

export function WorkspaceHeader({
  title,
  eyebrow,
  status,
  backHref,
  backLabel,
  actions,
}: WorkspaceHeaderProps) {
  return (
    <header className="flex flex-col gap-5 border-b border-neutral-200 pb-6 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-sm font-medium text-neutral-500 transition hover:text-neutral-950"
        >
          <span aria-hidden="true">←</span>
          {backLabel}
        </Link>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="min-w-0">
            {eyebrow ? (
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
                {eyebrow}
              </p>
            ) : null}

            <h1 className="truncate text-2xl font-semibold tracking-tight text-neutral-950 sm:text-3xl">
              {title}
            </h1>
          </div>

          {status ? <div className="shrink-0">{status}</div> : null}
        </div>
      </div>

      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-3">{actions}</div> : null}
    </header>
  )
}
