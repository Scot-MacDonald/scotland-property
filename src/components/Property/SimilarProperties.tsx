import { PropertyCard } from '@/components/Property/PropertyCard'

type Props = {
  properties: any[]
  regionName?: string
}

export function SimilarProperties({ properties, regionName }: Props) {
  if (!properties.length) return null

  return (
    <section className="mt-24 border-t pt-16">
      <div className="mb-10 max-w-3xl">
        <p className="mb-3 text-sm uppercase tracking-[0.35em] text-muted-foreground">
          {regionName ? `${regionName} Collection` : 'Scotland Collection'}
        </p>

        <h2 className="text-4xl font-medium tracking-tight">More Exceptional Homes</h2>

        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          A curated selection of exceptional homes from Scotland's leading estate agencies.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {properties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </section>
  )
}
