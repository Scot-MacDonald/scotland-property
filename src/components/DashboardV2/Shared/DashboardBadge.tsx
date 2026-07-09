type DashboardBadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'premium'

const toneClasses: Record<DashboardBadgeTone, string> = {
  neutral: 'border-black/10 bg-neutral-100 text-black/70',
  success: 'border-green-200 bg-green-50 text-green-700',
  warning: 'border-yellow-200 bg-yellow-50 text-yellow-800',
  danger: 'border-red-200 bg-red-50 text-red-700',
  premium: 'border-black bg-black text-white',
}

export function DashboardBadge({
  children,
  tone = 'neutral',
}: {
  children: React.ReactNode
  tone?: DashboardBadgeTone
}) {
  return (
    <span
      className={`inline-flex items-center border px-2.5 py-1 text-xs uppercase tracking-[0.18em] ${toneClasses[tone]}`}
    >
      {children}
    </span>
  )
}
