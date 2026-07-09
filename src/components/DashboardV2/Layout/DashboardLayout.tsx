import { DashboardSidebar } from './DashboardSidebar'
import { DashboardTopbar } from './DashboardTopbar'

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[#f7f4ef] text-black">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <DashboardSidebar />

        <div>
          <DashboardTopbar />

          <div className="mx-auto w-full max-w-[1680px] px-4 py-10 md:px-8">{children}</div>
        </div>
      </div>
    </main>
  )
}
