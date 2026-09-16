import Link from 'next/link'

type BuyerWorkspaceSectionTitleProps = {
  eyebrow?: string
  title: string
  description?: string
  href?: string
  linkLabel?: string
}

export function BuyerWorkspaceSectionTitle({
  eyebrow,
  title,
  description,
  href,
  linkLabel = 'View all',
}: BuyerWorkspaceSectionTitleProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-black/10 p-6 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow && <p className="text-xs uppercase tracking-[0.24em] text-black/40">{eyebrow}</p>}

        <h2 className="mt-2 text-2xl font-medium tracking-tight md:text-3xl">{title}</h2>

        {description && <p className="mt-2 max-w-2xl text-sm text-black/55">{description}</p>}
      </div>

      {href && (
        <Link
          href={href}
          className="w-fit border border-black px-4 py-2 text-sm transition hover:bg-black hover:text-white"
        >
          {linkLabel}
        </Link>
      )}
    </div>
  )
}
