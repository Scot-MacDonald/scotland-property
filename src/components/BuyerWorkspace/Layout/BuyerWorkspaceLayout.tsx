import type { ReactNode } from 'react'

import { BuyerWorkspaceSidebar, type BuyerWorkspaceNavigationCounts } from './BuyerWorkspaceSidebar'
import { BuyerWorkspaceTopbar } from './BuyerWorkspaceTopbar'

type BuyerWorkspaceLayoutProps = {
  children: ReactNode
  buyerName?: string | null
  buyerEmail?: string | null
  navigationCounts?: BuyerWorkspaceNavigationCounts
}

export function BuyerWorkspaceLayout({
  children,
  buyerName,
  buyerEmail,
  navigationCounts,
}: BuyerWorkspaceLayoutProps) {
  return (
    <main className="min-h-screen bg-[#f7f4ef] text-black">
      <div className="grid min-h-screen lg:grid-cols-[280px_minmax(0,1fr)]">
        <BuyerWorkspaceSidebar counts={navigationCounts} />

        <div className="min-w-0">
          <BuyerWorkspaceTopbar buyerName={buyerName} buyerEmail={buyerEmail} />

          <div className="mx-auto w-full max-w-[1680px] px-4 py-10 md:px-8">{children}</div>
        </div>
      </div>
    </main>
  )
}
