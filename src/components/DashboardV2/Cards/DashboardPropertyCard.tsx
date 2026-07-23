import Link from 'next/link'
import { DashboardBadge } from '../Shared/DashboardBadge'

function getStatusTone(status?: string | null) {
  if (status === 'for-sale' || status === 'For Sale') return 'success'
  if (status === 'sold' || status === 'Sold') return 'danger'
  if (status === 'reserved' || status === 'Reserved') return 'warning'

  return 'neutral'
}

export function DashboardPropertyCard({
  title,
  location,
  price,
  status = 'For Sale',
  reference = 'RET-001',
  bedrooms = 4,
  bathrooms = 3,
  image,
  href = '/dashboard/properties',
  viewHref = '/properties',
  featured = false,
}: {
  title: string
  location: string
  price: string
  status?: string
  reference?: string
  bedrooms?: number
  bathrooms?: number
  image?: string | null
  href?: string
  viewHref?: string
  featured?: boolean
}) {
  return (
    <article className="grid gap-6 border border-black/10 bg-white p-5 md:grid-cols-[220px_1fr_auto] md:items-center">
      <div className="aspect-[4/3] bg-neutral-200">
        {image ? <img src={image} alt={title} className="h-full w-full object-cover" /> : null}
      </div>

      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-black/45">{location}</p>

        <h3 className="mt-2 text-3xl font-medium">{title}</h3>

        <p className="mt-3 text-2xl">{price}</p>

        <div className="mt-4 flex flex-wrap gap-3">
          <DashboardBadge tone={getStatusTone(status)}>{status}</DashboardBadge>

          {featured && <DashboardBadge tone="premium">Featured</DashboardBadge>}
        </div>

        <p className="mt-4 text-sm text-black/60">
          {bedrooms} Bed • {bathrooms} Bath • Ref {reference}
        </p>
      </div>

      <div className="flex gap-2 md:flex-col">
        <Link href={href} className="bg-black px-5 py-3 text-center text-sm text-white">
          Edit
        </Link>

        <Link href={viewHref} className="border border-black/10 px-5 py-3 text-center text-sm">
          View
        </Link>
      </div>
    </article>
  )
}
