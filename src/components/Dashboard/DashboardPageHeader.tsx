import Link from 'next/link'

type DashboardPageHeaderAction = {
  label: string
  href: string
  variant?: 'primary' | 'secondary'
}

export function DashboardPageHeader({
  eyebrow,
  title,
  description,
  actions = [],
}: {
  eyebrow: string
  title: string
  description?: string
  actions?: DashboardPageHeaderAction[]
}) {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">{eyebrow}</p>

        <h1 className="mt-2 text-5xl font-medium tracking-tight">{title}</h1>

        {description && <p className="mt-4 max-w-2xl text-muted-foreground">{description}</p>}
      </div>

      {actions.length > 0 && (
        <div className="flex gap-3">
          {actions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className={
                action.variant === 'primary'
                  ? 'bg-black px-4 py-2 text-sm text-white'
                  : 'border px-4 py-2 text-sm'
              }
            >
              {action.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
