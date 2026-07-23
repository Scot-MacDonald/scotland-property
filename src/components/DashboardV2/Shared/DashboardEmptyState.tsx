import { DashboardButton } from './DashboardButton'

export function DashboardEmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string
  description?: string
  actionHref?: string
  actionLabel?: string
}) {
  return (
    <div className="border border-black/10 bg-white p-10 text-center">
      <h3 className="text-2xl font-medium">{title}</h3>

      {description && (
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-black/60">{description}</p>
      )}

      {actionHref && actionLabel && (
        <div className="mt-6">
          <DashboardButton href={actionHref} variant="primary">
            {actionLabel}
          </DashboardButton>
        </div>
      )}
    </div>
  )
}
