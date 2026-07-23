export function DashboardPanel({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="border border-black/10 bg-white p-6">
      {title && <h3 className="border-b border-black/10 pb-4 text-2xl font-medium">{title}</h3>}

      <div className={title ? 'mt-4' : ''}>{children}</div>
    </div>
  )
}
