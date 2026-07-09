import Link from 'next/link'

export function DashboardEmptyState({
  title,
  description,
  href,
  actionLabel,
}: {
  title: string
  description: string
  href?: string
  actionLabel?: string
}) {
  return (
    <div className="p-10 text-center">
      <h3 className="text-2xl font-medium">{title}</h3>

      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">{description}</p>

      {href && actionLabel && (
        <Link
          href={href}
          className="mt-6 inline-flex bg-black px-5 py-3 text-sm uppercase tracking-[0.18em] text-white transition hover:bg-neutral-800"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  )
}
