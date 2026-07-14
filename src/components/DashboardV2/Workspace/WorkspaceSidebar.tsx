import type { ReactNode } from 'react'

type WorkspaceSidebarProps = {
  title?: string
  children: ReactNode
}

export function WorkspaceSidebar({ title = 'Details', children }: WorkspaceSidebarProps) {
  return (
    <aside className="overflow-hidden border border-neutral-200 bg-white">
      <div className="border-b border-neutral-200 px-5 py-4">
        <h2 className="text-sm font-semibold tracking-wide text-neutral-900">{title}</h2>
      </div>

      <div className="divide-y divide-neutral-100">{children}</div>
    </aside>
  )
}

type WorkspaceSidebarItemProps = {
  label: string
  value?: ReactNode
}

export function WorkspaceSidebarItem({ label, value }: WorkspaceSidebarItemProps) {
  return (
    <div className="px-5 py-4">
      <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">{label}</p>

      <div className="mt-1 text-sm text-neutral-900">{value ?? '—'}</div>
    </div>
  )
}
