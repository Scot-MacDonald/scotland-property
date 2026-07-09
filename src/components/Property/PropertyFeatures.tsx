type Props = {
  property: any
}

export function PropertyFeatures({ property }: Props) {
  if (!property.propertyFeatures?.length) return null

  return (
    <section className="mb-10">
      <h2 className="mb-5 text-xl font-medium">Property Features</h2>

      <ul className="grid gap-3 md:grid-cols-2">
        {property.propertyFeatures.map((feature: { feature: string }, index: number) => (
          <li key={index} className="border-b py-3 text-muted-foreground">
            {feature.feature}
          </li>
        ))}
      </ul>
    </section>
  )
}
