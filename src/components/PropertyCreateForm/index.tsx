'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, type FormEvent, type ReactNode } from 'react'

type RelationshipOption = {
  id: string | number
  name?: string | null
  email?: string | null
}

type PropertyCreateFormProps = {
  regions: RelationshipOption[]
  towns: RelationshipOption[]
  propertyTypes: RelationshipOption[]
  amenities: RelationshipOption[]
  agents: RelationshipOption[]
}

export default function PropertyCreateForm({
  regions,
  towns,
  propertyTypes,
  amenities,
  agents,
}: PropertyCreateFormProps) {
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setLoading(true)
    setError('')

    try {
      const formData = new FormData(event.currentTarget)

      const response = await fetch('/api/create-property', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error || 'Could not create property.')
      }

      router.push('/dashboard/properties')
      router.refresh()
    } catch (submissionError) {
      setError(
        submissionError instanceof Error ? submissionError.message : 'Could not create property.',
      )

      setLoading(false)
    }
  }

  const inputClasses =
    'mt-2 w-full border border-black/15 bg-white px-4 py-3 text-sm text-black outline-none transition placeholder:text-black/35 focus:border-black disabled:cursor-not-allowed disabled:bg-black/[0.03]'

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error ? (
        <div className="border border-red-300 bg-red-50 px-5 py-4 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      <FormSection
        eyebrow="Listing"
        title="Property details"
        description="Enter the main information buyers will see on the listing."
      >
        <div className="grid gap-6 md:grid-cols-2">
          <Field label="Title" required>
            <input
              name="title"
              required
              className={inputClasses}
              placeholder="Luxury villa in St Andrews"
            />
          </Field>

          <Field label="Price">
            <input
              name="price"
              type="number"
              min="0"
              step="1"
              className={inputClasses}
              placeholder="1500000"
            />
          </Field>

          <Field label="Status">
            <select name="status" className={inputClasses} defaultValue="for-sale">
              <option value="for-sale">For sale</option>
              <option value="reserved">Reserved</option>
              <option value="sold">Sold</option>
            </select>
          </Field>

          <Field label="Property type">
            <select name="propertyType" className={inputClasses} defaultValue="">
              <option value="">Select type</option>

              {propertyTypes.map((type) => (
                <option key={String(type.id)} value={String(type.id)}>
                  {type.name || 'Unnamed property type'}
                </option>
              ))}
            </select>
          </Field>

          <div className="md:col-span-2">
            <Field label="Excerpt">
              <textarea
                name="excerpt"
                rows={4}
                className={`${inputClasses} resize-y`}
                placeholder="A short summary of the property."
              />
            </Field>
          </div>
        </div>
      </FormSection>

      <FormSection
        eyebrow="Location"
        title="Area and coordinates"
        description="Assign the listing to its region and town, with optional map coordinates."
      >
        <div className="grid gap-6 md:grid-cols-2">
          <Field label="Region">
            <select name="region" className={inputClasses} defaultValue="">
              <option value="">Select region</option>

              {regions.map((region) => (
                <option key={String(region.id)} value={String(region.id)}>
                  {region.name || 'Unnamed region'}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Town">
            <select name="town" className={inputClasses} defaultValue="">
              <option value="">Select town</option>

              {towns.map((town) => (
                <option key={String(town.id)} value={String(town.id)}>
                  {town.name || 'Unnamed town'}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Latitude">
            <input
              name="latitude"
              type="number"
              step="any"
              className={inputClasses}
              placeholder="56.3398"
            />
          </Field>

          <Field label="Longitude">
            <input
              name="longitude"
              type="number"
              step="any"
              className={inputClasses}
              placeholder="-2.7967"
            />
          </Field>
        </div>
      </FormSection>

      <FormSection
        eyebrow="Specifications"
        title="Property measurements"
        description="Add the key facts used in property search and listing cards."
      >
        <div className="grid gap-6 md:grid-cols-2">
          <Field label="Bedrooms">
            <input
              name="bedrooms"
              type="number"
              min="0"
              step="1"
              className={inputClasses}
              placeholder="4"
            />
          </Field>

          <Field label="Bathrooms">
            <input
              name="bathrooms"
              type="number"
              min="0"
              step="1"
              className={inputClasses}
              placeholder="3"
            />
          </Field>

          <Field label="Internal area m²">
            <input
              name="internalArea"
              type="number"
              min="0"
              step="any"
              className={inputClasses}
              placeholder="280"
            />
          </Field>

          <Field label="Land area">
            <input name="landArea" className={inputClasses} placeholder="5 acres" />
          </Field>
        </div>
      </FormSection>

      <FormSection
        eyebrow="Assignment"
        title="Agent and amenities"
        description="Assign the listing to an agent and select its main amenities."
      >
        <div className="grid gap-6 md:grid-cols-2">
          <Field label="Agent">
            <select name="agent" className={inputClasses} defaultValue="">
              <option value="">Select agent</option>

              {agents.map((agent) => (
                <option key={String(agent.id)} value={String(agent.id)}>
                  {agent.name || agent.email || 'Unnamed agent'}
                </option>
              ))}
            </select>
          </Field>

          <div className="md:col-span-2">
            <Field
              label="Amenities"
              helpText="Hold Command on Mac or Control on Windows to select multiple amenities."
            >
              <select name="amenities" multiple className={`${inputClasses} min-h-48`}>
                {amenities.map((amenity) => (
                  <option key={String(amenity.id)} value={String(amenity.id)}>
                    {amenity.name || 'Unnamed amenity'}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </div>
      </FormSection>

      <FormSection
        eyebrow="Media"
        title="Property images"
        description="Upload the main listing image and an initial gallery."
      >
        <div className="grid gap-6 md:grid-cols-2">
          <Field
            label="Featured image"
            helpText="This image will be used as the main property thumbnail."
          >
            <input
              name="featuredImage"
              type="file"
              accept="image/*"
              className={`${inputClasses} file:mr-4 file:border-0 file:bg-black file:px-4 file:py-2 file:text-xs file:font-medium file:uppercase file:tracking-[0.12em] file:text-white`}
            />
          </Field>

          <Field label="Gallery images" helpText="You can select several images at once.">
            <input
              name="gallery"
              type="file"
              accept="image/*"
              multiple
              className={`${inputClasses} file:mr-4 file:border-0 file:bg-black file:px-4 file:py-2 file:text-xs file:font-medium file:uppercase file:tracking-[0.12em] file:text-white`}
            />
          </Field>
        </div>
      </FormSection>

      <div className="flex flex-col-reverse gap-3 border-t border-black/10 pt-6 sm:flex-row sm:justify-end">
        <Link
          href="/dashboard/properties"
          className="border border-black/15 px-6 py-3 text-center text-sm font-medium uppercase tracking-[0.14em] text-black transition hover:bg-black/5"
        >
          Cancel
        </Link>

        <button
          type="submit"
          disabled={loading}
          className="bg-black px-6 py-3 text-sm font-medium uppercase tracking-[0.14em] text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Creating…' : 'Create property'}
        </button>
      </div>
    </form>
  )
}

function FormSection({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <section className="border border-black/10 bg-white">
      <div className="border-b border-black/10 px-6 py-5">
        <p className="text-xs uppercase tracking-[0.2em] text-black/45">{eyebrow}</p>
        <h2 className="mt-2 text-xl font-medium">{title}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-black/55">{description}</p>
      </div>

      <div className="p-6">{children}</div>
    </section>
  )
}

function Field({
  label,
  children,
  required = false,
  helpText,
}: {
  label: string
  children: ReactNode
  required?: boolean
  helpText?: string
}) {
  return (
    <label className="block">
      <span className="block text-xs font-medium uppercase tracking-[0.16em] text-black/60">
        {label}
        {required ? <span className="ml-1 text-red-700">*</span> : null}
      </span>

      {children}

      {helpText ? (
        <span className="mt-2 block text-xs leading-5 text-black/45">{helpText}</span>
      ) : null}
    </label>
  )
}
