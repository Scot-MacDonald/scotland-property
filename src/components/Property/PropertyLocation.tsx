type Props = {
  property: any
}

export function PropertyLocation({ property }: Props) {
  const region = typeof property.region === 'object' ? property.region : null
  const town = typeof property.town === 'object' ? property.town : null

  if (!region && !town) return null

  return (
    <p className="text-sm text-muted-foreground">
      {town?.name ? `${town.name}, ` : ''}
      {region?.name || ''}
    </p>
  )
}
