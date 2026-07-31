import Link from 'next/link'

export function RecentlyViewedEmptyState() {
  return (
    <div className="flex min-h-[420px] flex-col items-start justify-center border border-dashed border-black/20 bg-white p-8 md:p-12">
      <p className="text-xs uppercase tracking-[0.25em] text-black/40">
        No recently viewed properties
      </p>

      <h2 className="mt-4 max-w-xl text-3xl font-medium tracking-tight md:text-4xl">
        Continue exploring Scotland&apos;s finest homes
      </h2>

      <p className="mt-5 max-w-xl text-sm leading-7 text-black/55">
        Properties you view while signed in will appear here, making it easy to return to homes
        that caught your attention.
      </p>

      <Link
        href="/properties"
        className="mt-8 bg-black px-6 py-3 text-sm text-white transition hover:bg-black/80"
      >
        Browse properties
      </Link>
    </div>
  )
}
