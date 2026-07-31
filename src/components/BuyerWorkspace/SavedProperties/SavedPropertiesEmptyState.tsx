import Link from 'next/link'

export function SavedPropertiesEmptyState() {
  return (
    <div className="flex min-h-[420px] flex-col items-start justify-center border border-dashed border-black/20 bg-white p-8 md:p-12">
      <p className="text-xs uppercase tracking-[0.25em] text-black/40">Your collection is empty</p>

      <h2 className="mt-4 max-w-xl text-3xl font-medium tracking-tight md:text-4xl">
        Start building your private property collection
      </h2>

      <p className="mt-5 max-w-xl text-sm leading-7 text-black/55">
        Save homes while browsing Scotland Luxury Estates and return here to review and compare your
        favourites.
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
