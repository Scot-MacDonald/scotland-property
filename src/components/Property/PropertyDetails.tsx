import Link from 'next/link'

type Props = {
  property: any
}

export function PropertyDetails({ property }: Props) {
  const region = typeof property.region === 'object' ? property.region : null
  const town = typeof property.town === 'object' ? property.town : null

  return (
    <div className="mb-10 border-y py-6">
      <h2 className="mb-5 text-xl font-medium">Property Details</h2>

      <dl className="grid gap-x-10 gap-y-4 text-sm md:grid-cols-2 lg:max-w-3xl">
        {property.bedrooms && (
          <div className="flex justify-between border-b pb-3">
            <dt className="text-muted-foreground">Bedrooms</dt>
            <dd>{property.bedrooms}</dd>
          </div>
        )}

        {property.bathrooms && (
          <div className="flex justify-between border-b pb-3">
            <dt className="text-muted-foreground">Bathrooms</dt>
            <dd>{property.bathrooms}</dd>
          </div>
        )}

        {property.internalArea && (
          <div className="flex justify-between border-b pb-3">
            <dt className="text-muted-foreground">Internal Area</dt>
            <dd>{property.internalArea} m²</dd>
          </div>
        )}

        {property.landArea && (
          <div className="flex justify-between border-b pb-3">
            <dt className="text-muted-foreground">Land Area</dt>
            <dd>{property.landArea} m²</dd>
          </div>
        )}

        {property.yearBuilt && (
          <div className="flex justify-between border-b pb-3">
            <dt className="text-muted-foreground">Year Built</dt>
            <dd>{property.yearBuilt}</dd>
          </div>
        )}

        {property.reference && (
          <div className="flex justify-between border-b pb-3">
            <dt className="text-muted-foreground">Reference</dt>
            <dd>{property.reference}</dd>
          </div>
        )}

        {property.propertyType && typeof property.propertyType === 'object' && (
          <div className="flex justify-between border-b pb-3">
            <dt className="text-muted-foreground">Property Type</dt>
            <dd>{property.propertyType.name}</dd>
          </div>
        )}

        {property.status && (
          <div className="flex justify-between border-b pb-3">
            <dt className="text-muted-foreground">Status</dt>
            <dd>{property.status}</dd>
          </div>
        )}

        {region && (
          <div className="flex justify-between border-b pb-3">
            <dt className="text-muted-foreground">Region</dt>
            <dd>
              <Link href={`/scotland/${region.slug}`} className="underline">
                {region.name}
              </Link>
            </dd>
          </div>
        )}

        {town && (
          <div className="flex justify-between border-b pb-3">
            <dt className="text-muted-foreground">Town</dt>
            <dd>
              <Link href={`/scotland/${region?.slug}/${town.slug}`} className="underline">
                {town.name}
              </Link>
            </dd>
          </div>
        )}

        {property.energyRating && (
          <div className="flex justify-between border-b pb-3">
            <dt className="text-muted-foreground">Energy Rating</dt>
            <dd>{property.energyRating}</dd>
          </div>
        )}
      </dl>
    </div>
  )
}
