import Link from 'next/link'

export function DashboardTopbar() {
  return (
    <header className="flex items-center justify-between border-b border-black/10 bg-[#f7f4ef] px-6 py-4 lg:px-8">
      <p className="text-sm uppercase tracking-[0.25em] text-black/50">Agency Workspace</p>

      <div className="flex items-center gap-4">
        <Link href="/" className="text-sm underline underline-offset-4">
          View Website
        </Link>

        <div className="h-9 w-9 bg-black text-white">
          <span className="flex h-full items-center justify-center text-sm">R</span>
        </div>
      </div>
    </header>
  )
}
