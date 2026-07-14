import Link from 'next/link'

export type WorkspaceTab = {
  id: string
  label: string
  href: string
  disabled?: boolean
}

type WorkspaceTabsProps = {
  tabs: WorkspaceTab[]
  activeTab: string
}

export function WorkspaceTabs({ tabs, activeTab }: WorkspaceTabsProps) {
  return (
    <nav className="overflow-x-auto border-b border-neutral-200" aria-label="Workspace navigation">
      <div className="flex min-w-max gap-1">
        {tabs.map((tab) => {
          const active = tab.id === activeTab

          if (tab.disabled) {
            return (
              <span
                key={tab.id}
                className="cursor-not-allowed border-b-2 border-transparent px-4 py-3 text-sm font-medium text-neutral-400"
                aria-disabled="true"
              >
                {tab.label}
              </span>
            )
          }

          return (
            <Link
              key={tab.id}
              href={tab.href}
              aria-current={active ? 'page' : undefined}
              className={[
                'border-b-2 px-4 py-3 text-sm font-medium transition',
                active
                  ? 'border-black text-black'
                  : 'border-transparent text-neutral-500 hover:border-neutral-300 hover:text-black',
              ].join(' ')}
            >
              {tab.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
