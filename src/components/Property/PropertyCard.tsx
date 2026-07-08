import Link from 'next/link'
import { PropertyCardSlider } from '@/components/PropertyCardSlider'
import { SavePropertyButton } from '@/components/SavePropertyButton'
import { PropertyPrice } from './PropertyPrice'
import { PropertyMeta } from './PropertyMeta'
import { PropertyLocation } from './PropertyLocation'
import { PropertyAgency } from './PropertyAgency'
type Props = {
  property: any
}

function getBadges(property: any) {
  const badges: string[] = []

  if (property.featured) badges.push('Featured')

  if (property.status === 'sold') badges.push('Sold')
  if (property.status === 'reserved') badges.push('Under Offer')

  return badges
}

export function PropertyCard({ property }: Props) {
  const image =
    typeof property.featuredImage === 'object' && property.featuredImage?.url
      ? property.featuredImage.url
      : null

  const images = [
    ...(image
      ? [
          {
            url: image,
            alt: property.title,
          },
        ]
      : []),

    ...(property.gallery || [])
      .filter((item: any) => typeof item === 'object' && item?.url && item.url !== image)
      .map((item: any) => ({
        url: item.url,
        alt: property.title,
      })),
  ]

  const badges = getBadges(property)

  return (
    <Link
      href={`/property/${property.slug}`}
      className="group relative block overflow-hidden border bg-white transition hover:border-black"
    >
      <SavePropertyButton propertyId={String(property.id)} />

      <div className="relative">
        <PropertyCardSlider images={images} title={property.title} />

        {badges.length > 0 ? (
          <div className="absolute left-4 top-4 z-10 flex flex-wrap gap-2">
            {badges.map((badge) => (
              <span
                key={badge}
                className="border border-white/80 bg-black/70 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white"
              >
                {badge}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className="space-y-4 p-6">
        <PropertyPrice price={property.price} />

        <div className="space-y-2">
          <h2 className="text-xl font-medium leading-snug tracking-tight transition group-hover:underline">
            {property.title}
          </h2>

          <PropertyLocation property={property} />
        </div>

        <div className="border-t pt-4">
          <PropertyMeta property={property} />
        </div>
        <div className="border-t pt-5">
          <PropertyAgency property={property} />
        </div>
      </div>
    </Link>
  )
}
