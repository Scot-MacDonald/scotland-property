export type DashboardView = 'list' | 'grid' | 'map'

export function DashboardViewSwitcher({ view = 'list' }: { view?: DashboardView }) {
  return (
    <div className="flex border border-black/10 bg-white">
      <button
        type="button"
        className={`px-4 py-2 text-sm ${
          view === 'list' ? 'bg-black text-white' : 'text-black hover:bg-black/5'
        }`}
      >
        List
      </button>

      <button
        type="button"
        className={`border-l border-black/10 px-4 py-2 text-sm ${
          view === 'grid' ? 'bg-black text-white' : 'text-black hover:bg-black/5'
        }`}
      >
        Grid
      </button>

      <button
        type="button"
        className={`border-l border-black/10 px-4 py-2 text-sm ${
          view === 'map' ? 'bg-black text-white' : 'text-black hover:bg-black/5'
        }`}
      >
        Map
      </button>
    </div>
  )
}
