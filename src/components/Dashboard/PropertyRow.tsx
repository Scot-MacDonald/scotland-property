import Link from 'next/link'
import DeletePropertyButton from '@/components/DeletePropertyButton'
import { DashboardBadge } from '@/components/Dashboard/DashboardBadge'

function formatPrice(value?: number | null) {
  if (!value) return 'Price on request'

  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(value)
}

function getStatusTone(status?: string | null) {
  if (status === 'for-sale') return 'success'
  if (status === 'sold') return 'danger'
  if (status === 'reserved') return 'warning'

  return 'neutral'
}

export function PropertyRow({ property }: { property: any }) {
  const image =
    typeof property.featuredImage === 'object' && property.featuredImage?.url
      ? property.featuredImage.url
      : null

  const town = property.town && typeof property.town === 'object' ? property.town.name : 'No town'

  return (
    <article className="grid gap-6 border-b border-black/10 bg-white p-5 transition hover:bg-neutral-50 last:border-b-0 lg:grid-cols-[180px_1fr_auto] lg:items-center">
      <div className="aspect-[4/3] bg-neutral-100">
        {image ? (
          <img src={image} alt={property.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.2em] text-muted-foreground">
            No Image
          </div>
        )}
      </div>

      <div>
        <div className="flex flex-wrap items-center gap-3">
          <DashboardBadge tone={getStatusTone(property.status)}>
            {property.status?.replaceAll('-', ' ') || 'Draft'}
          </DashboardBadge>

          {property.featured && <DashboardBadge tone="premium">Featured</DashboardBadge>}
        </div>

        <h2 className="mt-4 text-2xl font-medium">{property.title}</h2>

        <p className="mt-1 text-sm text-muted-foreground">{town}</p>

        <div className="mt-5 flex flex-wrap gap-x-8 gap-y-2 text-sm">
          <p>
            <span className="text-muted-foreground">Price</span>{' '}
            <span className="font-medium">{formatPrice(property.price)}</span>
          </p>

          <p>
            <span className="text-muted-foreground">Reference</span>{' '}
            <span className="font-medium">{property.reference || property.slug}</span>
          </p>

          {property.bedrooms ? (
            <p>
              <span className="text-muted-foreground">Bedrooms</span>{' '}
              <span className="font-medium">{property.bedrooms}</span>
            </p>
          ) : null}

          {property.bathrooms ? (
            <p>
              <span className="text-muted-foreground">Bathrooms</span>{' '}
              <span className="font-medium">{property.bathrooms}</span>
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex gap-2 lg:flex-col lg:items-stretch">
        <Link href={`/property/${property.slug}`} className="border px-4 py-2 text-center text-sm">
          View
        </Link>

        <Link
          href={`/dashboard/properties/${property.id}/edit`}
          className="border px-4 py-2 text-center text-sm"
        >
          Edit
        </Link>

        <DeletePropertyButton propertyId={property.id} />
      </div>
    </article>
  )
}
