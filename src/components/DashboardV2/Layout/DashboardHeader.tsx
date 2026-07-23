import { DashboardButton } from '../Shared/DashboardButton'

type DashboardHeaderAction = {
  label: string
  href: string
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
}

export function DashboardHeader({
  eyebrow,
  title,
  description,
  actions = [],
}: {
  eyebrow?: string
  title: string
  description?: string
  actions?: DashboardHeaderAction[]
}) {
  return (
    <header className="mb-10 flex flex-col gap-6 border-b border-black/10 pb-8 lg:flex-row lg:items-end lg:justify-between">
      <div>
        {eyebrow && <p className="text-sm uppercase tracking-[0.35em] text-black/50">{eyebrow}</p>}

        <h1 className="mt-3 text-5xl font-medium tracking-tight lg:text-6xl">{title}</h1>

        {description && (
          <p className="mt-4 max-w-2xl text-sm leading-6 text-black/60">{description}</p>
        )}
      </div>

      {actions.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {actions.map((action) => (
            <DashboardButton
              key={action.href}
              href={action.href}
              variant={action.variant || 'secondary'}
            >
              {action.label}
            </DashboardButton>
          ))}
        </div>
      )}
    </header>
  )
}
