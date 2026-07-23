import Link from 'next/link'

import { DashboardLogoutButton } from './DashboardLogoutButton'

type DashboardTopbarProps = {
  agencyName?: string
}

export function DashboardTopbar({ agencyName = 'Agency' }: DashboardTopbarProps) {
  const initial = agencyName.trim().charAt(0).toUpperCase() || 'A'

  return (
    <header className="flex items-center justify-between border-b border-black/10 bg-[#f7f4ef] px-6 py-4 lg:px-8">
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-black/40">Agency Workspace</p>

        <p className="mt-1 text-sm font-medium">{agencyName}</p>
      </div>

      <div className="flex items-center gap-4">
        <Link href="/" className="text-sm underline underline-offset-4">
          View Website
        </Link>

        <DashboardLogoutButton />

        <div
          className="flex h-9 w-9 items-center justify-center bg-black text-sm font-medium text-white"
          aria-label={agencyName}
        >
          {initial}
        </div>
      </div>
    </header>
  )
}
