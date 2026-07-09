import Link from 'next/link'
import { DashboardBadge } from '../Shared/DashboardBadge'

function getLeadTone(status?: string) {
  if (status === 'instruction-won') return 'success'
  if (status === 'valuation-booked') return 'warning'
  if (status === 'lost') return 'danger'

  return 'neutral'
}

export function DashboardLeadCard({
  name,
  postcode,
  estimatedValue,
  status = 'new',
  href = '/dashboard/leads',
}: {
  name: string
  postcode?: string
  estimatedValue?: string
  status?: string
  href?: string
}) {
  return (
    <article className="border border-black/10 bg-white p-6">
      <DashboardBadge tone={getLeadTone(status)}>{status.replaceAll('-', ' ')}</DashboardBadge>

      <h3 className="mt-4 text-2xl font-medium">{name}</h3>

      <div className="mt-4 grid gap-2 text-sm text-black/60">
        {postcode && <p>Postcode: {postcode}</p>}
        {estimatedValue && <p>Estimated value: {estimatedValue}</p>}
      </div>

      <Link
        href={href}
        className="mt-5 inline-flex border border-black/10 px-4 py-2 text-sm transition hover:border-black"
      >
        View Lead
      </Link>
    </article>
  )
}
