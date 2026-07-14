import type { ReactNode } from 'react'

type WorkspaceLayoutProps = {
  header: ReactNode
  tabs?: ReactNode
  sidebar?: ReactNode
  children: ReactNode
}

export function WorkspaceLayout({ header, tabs, sidebar, children }: WorkspaceLayoutProps) {
  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div>{header}</div>

      {tabs ? <div>{tabs}</div> : null}

      <div className="grid items-start gap-6 xl:grid-cols-12">
        <main className={sidebar ? 'xl:col-span-8' : 'xl:col-span-12'}>
          <div className="space-y-6">{children}</div>
        </main>

        {sidebar ? (
          <aside className="space-y-6 xl:col-span-4 xl:sticky xl:top-6">{sidebar}</aside>
        ) : null}
      </div>
    </div>
  )
}
