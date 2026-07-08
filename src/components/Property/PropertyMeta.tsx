type Props = {
  property: any
}

export function PropertyMeta({ property }: Props) {
  const items = [
    property.bedrooms ? `${property.bedrooms} Beds` : null,
    property.bathrooms ? `${property.bathrooms} Baths` : null,
    property.internalArea ? `${property.internalArea} m²` : null,
    property.landArea ? `${property.landArea} acres` : null,
  ].filter(Boolean)

  if (items.length === 0) return null

  return <p className="text-sm text-muted-foreground">{items.join(' · ')}</p>
}
