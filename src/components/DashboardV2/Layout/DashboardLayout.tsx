import type { ReactNode } from 'react'

import { DashboardSidebar, type DashboardNavigationCounts } from './DashboardSidebar'
import { DashboardTopbar } from './DashboardTopbar'

type DashboardLayoutProps = {
  children: ReactNode
  navigationCounts?: DashboardNavigationCounts
  agencyName?: string
}

export function DashboardLayout({ children, navigationCounts, agencyName }: DashboardLayoutProps) {
  return (
    <main className="min-h-screen bg-[#f7f4ef] text-black">
      <div className="grid min-h-screen lg:grid-cols-[280px_minmax(0,1fr)]">
        <DashboardSidebar counts={navigationCounts} />

        <div className="min-w-0">
          <DashboardTopbar agencyName={agencyName} />

          <div className="mx-auto w-full max-w-[1680px] px-4 py-10 md:px-8">{children}</div>
        </div>
      </div>
    </main>
  )
}
