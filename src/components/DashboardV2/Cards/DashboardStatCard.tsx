export function DashboardStatCard({
  label,
  value,
  description,
}: {
  label: string
  value: string | number
  description?: string
}) {
  return (
    <div className="border border-black/10 bg-white p-6">
      <p className="text-sm uppercase tracking-[0.22em] text-black/45">{label}</p>

      <p className="mt-4 text-4xl font-medium">{value}</p>

      {description && <p className="mt-2 text-sm leading-6 text-black/60">{description}</p>}
    </div>
  )
}
