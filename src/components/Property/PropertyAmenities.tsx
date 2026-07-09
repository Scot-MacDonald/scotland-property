type Props = {
  property: any
}

export function PropertyAmenities({ property }: Props) {
  if (!property.amenities?.length) return null

  return (
    <section className="mb-10">
      <h2 className="mb-5 text-xl font-medium">Amenities</h2>

      <div className="flex flex-wrap gap-3">
        {property.amenities.map((amenity: any) => (
          <span key={amenity.id} className="border px-4 py-2 text-sm">
            {amenity.name}
          </span>
        ))}
      </div>
    </section>
  )
}
