import { DashboardButton } from '../Shared/DashboardButton'
import { DashboardView, DashboardViewSwitcher } from './DashboardViewSwitcher'

type DashboardToolbarFilter = {
  label: string
  name: string
  options: {
    label: string
    value: string
  }[]
}

export function DashboardToolbar({
  searchPlaceholder = 'Search...',
  filters = [],
  actionHref,
  actionLabel,
  view = 'list',
}: {
  searchPlaceholder?: string
  filters?: DashboardToolbarFilter[]
  actionHref?: string
  actionLabel?: string
  view?: DashboardView
}) {
  return (
    <form className="mb-6 flex flex-col gap-3 border border-black/10 bg-white p-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-1 flex-col gap-3 lg:flex-row">
        <input
          type="search"
          name="q"
          placeholder={searchPlaceholder}
          className="min-h-11 flex-1 border border-black/10 bg-white px-4 text-sm outline-none placeholder:text-black/40 focus:border-black"
        />

        {filters.map((filter) => (
          <select
            key={filter.name}
            name={filter.name}
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

      <div className="flex flex-wrap gap-3">
        <DashboardViewSwitcher view={view} />

        {actionHref && actionLabel && (
          <DashboardButton href={actionHref} variant="primary">
            {actionLabel}
          </DashboardButton>
        )}
      </div>
    </form>
  )
}
