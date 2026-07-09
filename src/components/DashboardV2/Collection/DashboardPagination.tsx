export function DashboardPagination({
  page = 1,
  totalPages = 1,
}: {
  page?: number
  totalPages?: number
}) {
  return (
    <div className="mt-6 flex items-center justify-between border-t border-black/10 pt-6">
      <p className="text-sm text-black/50">
        Page {page} of {totalPages}
      </p>

      <div className="flex gap-2">
        <button
          type="button"
          className="border border-black/10 px-4 py-2 text-sm disabled:opacity-40"
          disabled={page <= 1}
        >
          Previous
        </button>

        <button
          type="button"
          className="border border-black/10 px-4 py-2 text-sm disabled:opacity-40"
          disabled={page >= totalPages}
        >
          Next
        </button>
      </div>
    </div>
  )
}
