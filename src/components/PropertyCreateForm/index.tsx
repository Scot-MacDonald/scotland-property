'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function PropertyCreateForm({
  regions,
  towns,
  propertyTypes,
  amenities,
  agents,
}: {
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

    const res = await fetch('/api/create-property', {
      method: 'POST',
      body: formData,
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data?.error || 'Could not create property.')
      setLoading(false)
      return
    }

    router.push('/dashboard/properties')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 border bg-white p-6">
      {error ? <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}

      <section className="grid gap-6 md:grid-cols-2">
        <Field label="Title">
          <input name="title" required className="input" placeholder="Luxury villa in St Andrews" />
        </Field>

        <Field label="Price">
          <input name="price" type="number" className="input" placeholder="1500000" />
        </Field>

        <Field label="Status">
          <select name="status" className="input" defaultValue="for-sale">
            <option value="for-sale">For sale</option>
            <option value="reserved">Reserved</option>
            <option value="sold">Sold</option>
          </select>
        </Field>

        <Field label="Property type">
          <select name="propertyType" className="input">
            <option value="">Select type</option>
            {propertyTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Region">
          <select name="region" className="input">
            <option value="">Select region</option>
            {regions.map((region) => (
              <option key={region.id} value={region.id}>
                {region.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Town">
          <select name="town" className="input">
            <option value="">Select town</option>
            {towns.map((town) => (
              <option key={town.id} value={town.id}>
                {town.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Bedrooms">
          <input name="bedrooms" type="number" className="input" />
        </Field>

        <Field label="Bathrooms">
          <input name="bathrooms" type="number" className="input" />
        </Field>

        <Field label="Internal area m²">
          <input name="internalArea" type="number" className="input" />
        </Field>

        <Field label="Land area">
          <input name="landArea" className="input" placeholder="5 acres" />
        </Field>

        <Field label="Latitude">
          <input name="latitude" type="number" step="any" className="input" />
        </Field>

        <Field label="Longitude">
          <input name="longitude" type="number" step="any" className="input" />
        </Field>

        <Field label="Agent">
          <select name="agent" className="input">
            <option value="">Select agent</option>
            {agents.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Featured image">
          <input name="featuredImage" type="file" accept="image/*" className="input" />
        </Field>

        <Field label="Gallery images">
          <input name="gallery" type="file" accept="image/*" multiple className="input" />
        </Field>
      </section>

      <Field label="Excerpt">
        <textarea name="excerpt" rows={3} className="input" />
      </Field>

      <Field label="Amenities">
        <select name="amenities" multiple className="input min-h-40">
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
        {loading ? 'Creating...' : 'Create property'}
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
