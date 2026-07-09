export function DashboardSectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-6">
      <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">{eyebrow}</p>

      <h2 className="mt-2 text-3xl font-medium">{title}</h2>
    </div>
  )
}
