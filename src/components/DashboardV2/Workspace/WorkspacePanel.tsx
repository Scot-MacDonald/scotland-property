import type { ReactNode } from 'react'

type WorkspacePanelProps = {
  title?: string
  description?: string
  actions?: ReactNode
  children: ReactNode
  className?: string
}

export function WorkspacePanel({
  title,
  description,
  actions,
  children,
  className = '',
}: WorkspacePanelProps) {
  const hasHeader = title || description || actions

  return (
    <section
      className={['overflow-hidden border border-neutral-200 bg-white', className]
        .filter(Boolean)
        .join(' ')}
    >
      {hasHeader ? (
        <div className="flex flex-col gap-4 border-b border-neutral-200 px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:px-6">
          <div className="min-w-0">
            {title ? <h2 className="text-base font-semibold text-neutral-950">{title}</h2> : null}

            {description ? (
              <p className="mt-1 text-sm leading-6 text-neutral-500">{description}</p>
            ) : null}
          </div>

          {actions ? <div className="shrink-0">{actions}</div> : null}
        </div>
      ) : null}

      <div className="p-5 sm:p-6">{children}</div>
    </section>
  )
}
