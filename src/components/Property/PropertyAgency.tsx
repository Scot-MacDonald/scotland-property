type Props = {
  property: any
}

export function PropertyAgency({ property }: Props) {
  const agency = typeof property.agency === 'object' ? property.agency : null

  if (!agency) return null

  const logo = typeof agency.logo === 'object' && agency.logo?.url ? agency.logo.url : null

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        {logo ? (
          <img src={logo} alt={agency.name} className="h-8 w-auto object-contain" />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full border text-xs font-medium">
            {agency.name.charAt(0)}
          </div>
        )}

        <span className="text-sm tracking-wide text-muted-foreground">{agency.name}</span>
      </div>
    </div>
  )
}
