import Link from 'next/link'

type BuyerViewingsEmptyStateProps = {
  title?: string
  description?: string
}

export function BuyerViewingsEmptyState({
  title = 'No viewings yet',
  description = 'Your upcoming and completed property appointments will appear here.',
}: BuyerViewingsEmptyStateProps) {
  return (
    <div className="flex min-h-[360px] flex-col items-start justify-center border border-dashed border-black/20 bg-white p-8 md:p-12">
      <p className="text-xs uppercase tracking-[0.25em] text-black/40">Property appointments</p>

      <h2 className="mt-4 text-3xl font-medium tracking-tight md:text-4xl">{title}</h2>

      <p className="mt-5 max-w-xl text-sm leading-7 text-black/55">{description}</p>

      <Link
        href="/properties"
        className="mt-8 bg-black px-6 py-3 text-sm text-white transition hover:bg-black/80"
      >
        Browse properties
      </Link>
    </div>
  )
}
