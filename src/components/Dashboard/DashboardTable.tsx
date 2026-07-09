import { ReactNode } from 'react'

export function DashboardTable({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-sm border border-black/10 bg-white shadow-sm">
      {children}
    </div>
  )
}

export function DashboardTableHeader({ children }: { children: ReactNode }) {
  return <div className="border-b border-black/10 bg-neutral-50">{children}</div>
}

export function DashboardTableBody({ children }: { children: ReactNode }) {
  return <div>{children}</div>
}

export function DashboardTableRow({ children }: { children: ReactNode }) {
  return (
    <div className="border-b border-black/5 transition hover:bg-neutral-50 last:border-b-0">
      {children}
    </div>
  )
}
