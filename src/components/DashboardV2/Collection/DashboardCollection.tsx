import { DashboardEmptyState } from '../Shared/DashboardEmptyState'
import { DashboardPagination } from './DashboardPagination'

export function DashboardCollection({
  children,
  empty = false,
  emptyTitle = 'Nothing here yet',
  emptyDescription = 'Once items are added, they will appear here.',
  showPagination = true,
}: {
  children: React.ReactNode
  empty?: boolean
  emptyTitle?: string
  emptyDescription?: string
  showPagination?: boolean
}) {
  return (
    <section>
      {empty ? (
        <DashboardEmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <div className="space-y-4">{children}</div>
      )}

      {showPagination && <DashboardPagination />}
    </section>
  )
}
