'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function PropertyEditForm({
  property,
  regions,
  towns,
  propertyTypes,
  amenities,
  agents,
}: {
  property: any
  regions: any[]
  towns: any[]
  propertyTypes: any[]
  amenities: any[]
  agents: any[]
}) {
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setLoading(true)
    setError('')

    const formData = new FormData(event.currentTarget)
    formData.append('id', property.id)

    const res = await fetch('/api/update-property', {
      method: 'POST',
      body: formData,
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data?.error || 'Could not update property.')
      setLoading(false)
      return
    }

    router.push('/dashboard/properties')
    router.refresh()
  }

  const featuredImage =
    typeof property.featuredImage === 'object' && property.featuredImage?.url
      ? property.featuredImage.url
      : null

  const selectedRegion = typeof property.region === 'object' ? property.region?.id : property.region

  const selectedTown = typeof property.town === 'object' ? property.town?.id : property.town

  const selectedType =
    typeof property.propertyType === 'object' ? property.propertyType?.id : property.propertyType

  const selectedAgent = typeof property.agent === 'object' ? property.agent?.id : property.agent

  const selectedAmenities = Array.isArray(property.amenities)
    ? property.amenities.map((amenity: any) => (typeof amenity === 'object' ? amenity.id : amenity))
    : []

  return (
    <form onSubmit={handleSubmit} className="space-y-8 border bg-white p-6">
      {error ? <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}

      {featuredImage ? (
        <div>
          <p className="mb-2 text-sm font-medium">Current featured image</p>
          <img src={featuredImage} alt={property.title} className="h-48 w-72 object-cover" />
        </div>
      ) : null}

      <section className="grid gap-6 md:grid-cols-2">
        <Field label="Title">
          <input name="title" required defaultValue={property.title} className="input" />
        </Field>

        <Field label="Price">
          <input name="price" type="number" defaultValue={property.price || ''} className="input" />
        </Field>

        <Field label="Status">
          <select name="status" className="input" defaultValue={property.status || 'for-sale'}>
            <option value="for-sale">For sale</option>
            <option value="reserved">Reserved</option>
            <option value="sold">Sold</option>
          </select>
        </Field>

        <Field label="Property type">
          <select name="propertyType" className="input" defaultValue={selectedType || ''}>
            <option value="">Select type</option>
            {propertyTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Region">
          <select name="region" className="input" defaultValue={selectedRegion || ''}>
            <option value="">Select region</option>
            {regions.map((region) => (
              <option key={region.id} value={region.id}>
                {region.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Town">
          <select name="town" className="input" defaultValue={selectedTown || ''}>
            <option value="">Select town</option>
            {towns.map((town) => (
              <option key={town.id} value={town.id}>
                {town.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Bedrooms">
          <input
            name="bedrooms"
            type="number"
            defaultValue={property.bedrooms || ''}
            className="input"
          />
        </Field>

        <Field label="Bathrooms">
          <input
            name="bathrooms"
            type="number"
            defaultValue={property.bathrooms || ''}
            className="input"
          />
        </Field>

        <Field label="Internal area m²">
          <input
            name="internalArea"
            type="number"
            defaultValue={property.internalArea || ''}
            className="input"
          />
        </Field>

        <Field label="Land area">
          <input name="landArea" defaultValue={property.landArea || ''} className="input" />
        </Field>

        <Field label="Latitude">
          <input
            name="latitude"
            type="number"
            step="any"
            defaultValue={property.latitude || ''}
            className="input"
          />
        </Field>

        <Field label="Longitude">
          <input
            name="longitude"
            type="number"
            step="any"
            defaultValue={property.longitude || ''}
            className="input"
          />
        </Field>

        <Field label="Agent">
          <select name="agent" className="input" defaultValue={selectedAgent || ''}>
            <option value="">Select agent</option>
            {agents.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Replace featured image">
          <input name="featuredImage" type="file" accept="image/*" className="input" />
        </Field>

        <Field label="Add gallery images">
          <input name="gallery" type="file" accept="image/*" multiple className="input" />
        </Field>
      </section>

      <Field label="Excerpt">
        <textarea name="excerpt" rows={3} defaultValue={property.excerpt || ''} className="input" />
      </Field>

      <Field label="Amenities">
        <select
          name="amenities"
          multiple
          className="input min-h-40"
          defaultValue={selectedAmenities}
        >
          {amenities.map((amenity) => (
            <option key={amenity.id} value={amenity.id}>
              {amenity.name}
            </option>
          ))}
        </select>
      </Field>

      <button
        type="submit"
        disabled={loading}
        className="bg-black px-5 py-3 text-white disabled:opacity-50"
      >
        {loading ? 'Saving...' : 'Save changes'}
      </button>
    </form>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  )
}
