export function DashboardSectionTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string
  title: string
  description?: string
}) {
  return (
    <div className="mb-6">
      {eyebrow && <p className="text-sm uppercase tracking-[0.3em] text-black/50">{eyebrow}</p>}

      <h2 className="mt-2 text-4xl font-medium">{title}</h2>

      {description && (
        <p className="mt-3 max-w-2xl text-sm leading-6 text-black/60">{description}</p>
      )}
    </div>
  )
}
