import Link from 'next/link'

type DashboardToolbarAction = {
  label: string
  href: string
}

type DashboardToolbarFilter = {
  label: string
  name: string
  value?: string
  options: {
    label: string
    value: string
  }[]
}

export function DashboardToolbar({
  searchPlaceholder = 'Search...',
  searchValue = '',
  filters = [],
  action,
}: {
  searchPlaceholder?: string
  searchValue?: string
  filters?: DashboardToolbarFilter[]
  action?: DashboardToolbarAction
}) {
  return (
    <form className="mb-8 flex flex-col gap-3 border border-black/10 bg-white p-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-1 flex-col gap-3 lg:flex-row">
        <input
          type="search"
          name="q"
          defaultValue={searchValue}
          placeholder={searchPlaceholder}
          className="min-h-11 flex-1 border border-black/10 bg-white px-4 text-sm outline-none placeholder:text-black/40 focus:border-black"
        />

        {filters.map((filter) => (
          <select
            key={filter.name}
            name={filter.name}
            defaultValue={filter.value || ''}
            className="min-h-11 border border-black/10 bg-white px-4 text-sm outline-none focus:border-black"
          >
            <option value="">{filter.label}</option>

            {filter.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ))}

        <button
          type="submit"
          className="min-h-11 border border-black px-5 text-sm uppercase tracking-[0.18em] transition hover:bg-black hover:text-white"
        >
          Filter
        </button>
      </div>

      {action && (
        <Link
          href={action.href}
          className="inline-flex min-h-11 items-center justify-center bg-black px-5 text-sm uppercase tracking-[0.18em] text-white transition hover:bg-neutral-800"
        >
          {action.label}
        </Link>
      )}
    </form>
  )
}
