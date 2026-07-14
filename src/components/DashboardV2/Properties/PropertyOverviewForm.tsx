'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { TextField } from '@/components/DashboardV2/Fields'
import { WorkspacePanel } from '@/components/DashboardV2/Workspace'

type PropertyOverviewFormProps = {
  property: {
    id: string
    title: string
    reference?: string | null
    excerpt?: string | null
    bedrooms?: number | null
    bathrooms?: number | null
    internalArea?: number | null
    landArea?: number | null
  }
}

type SaveState = 'idle' | 'saving' | 'success' | 'error'

export function PropertyOverviewForm({ property }: PropertyOverviewFormProps) {
  const router = useRouter()

  const [title, setTitle] = useState(property.title)
  const [reference, setReference] = useState(property.reference || '')
  const [excerpt, setExcerpt] = useState(property.excerpt || '')
  const [bedrooms, setBedrooms] = useState(property.bedrooms?.toString() || '')
  const [bathrooms, setBathrooms] = useState(property.bathrooms?.toString() || '')
  const [internalArea, setInternalArea] = useState(property.internalArea?.toString() || '')
  const [landArea, setLandArea] = useState(property.landArea?.toString() || '')

  const [savedValues, setSavedValues] = useState({
    title: property.title,
    reference: property.reference || '',
    excerpt: property.excerpt || '',
    bedrooms: property.bedrooms?.toString() || '',
    bathrooms: property.bathrooms?.toString() || '',
    internalArea: property.internalArea?.toString() || '',
    landArea: property.landArea?.toString() || '',
  })

  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const currentValues = {
    title,
    reference,
    excerpt,
    bedrooms,
    bathrooms,
    internalArea,
    landArea,
  }

  const hasChanges =
    currentValues.title !== savedValues.title ||
    currentValues.reference !== savedValues.reference ||
    currentValues.excerpt !== savedValues.excerpt ||
    currentValues.bedrooms !== savedValues.bedrooms ||
    currentValues.bathrooms !== savedValues.bathrooms ||
    currentValues.internalArea !== savedValues.internalArea ||
    currentValues.landArea !== savedValues.landArea

  function resetForm() {
    setTitle(savedValues.title)
    setReference(savedValues.reference)
    setExcerpt(savedValues.excerpt)
    setBedrooms(savedValues.bedrooms)
    setBathrooms(savedValues.bathrooms)
    setInternalArea(savedValues.internalArea)
    setLandArea(savedValues.landArea)
    setSaveState('idle')
    setErrorMessage('')
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!title.trim()) {
      setSaveState('error')
      setErrorMessage('Property title is required.')
      return
    }

    setSaveState('saving')
    setErrorMessage('')

    const formData = new FormData()

    formData.set('id', property.id)
    formData.set('title', title.trim())
    formData.set('reference', reference.trim())
    formData.set('excerpt', excerpt.trim())
    formData.set('bedrooms', bedrooms)
    formData.set('bathrooms', bathrooms)
    formData.set('internalArea', internalArea)
    formData.set('landArea', landArea)

    try {
      const response = await fetch('/api/update-property', {
        method: 'POST',
        body: formData,
      })

      const result = (await response.json()) as {
        ok?: boolean
        error?: string
      }

      if (!response.ok || !result.ok) {
        throw new Error(result.error || 'Could not update property.')
      }

      setSavedValues(currentValues)
      setSaveState('success')

      router.refresh()

      window.setTimeout(() => {
        setSaveState('idle')
      }, 2500)
    } catch (error) {
      setSaveState('error')
      setErrorMessage(error instanceof Error ? error.message : 'Could not update property.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <WorkspacePanel
        title="Property overview"
        description="The primary information used across the listing and agency dashboard."
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <TextField
              label="Title"
              name="title"
              value={title}
              onChange={(event) => {
                setTitle(event.target.value)
                setSaveState('idle')
              }}
              error={
                saveState === 'error' && !title.trim() ? 'Property title is required.' : undefined
              }
              required
            />
          </div>

          <TextField
            label="Reference"
            name="reference"
            value={reference}
            onChange={(event) => {
              setReference(event.target.value)
              setSaveState('idle')
            }}
          />
        </div>
      </WorkspacePanel>

      <WorkspacePanel
        title="Property specifications"
        description="The principal measurements and accommodation details."
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <TextField
            label="Bedrooms"
            name="bedrooms"
            type="number"
            min="0"
            value={bedrooms}
            onChange={(event) => {
              setBedrooms(event.target.value)
              setSaveState('idle')
            }}
          />

          <TextField
            label="Bathrooms"
            name="bathrooms"
            type="number"
            min="0"
            value={bathrooms}
            onChange={(event) => {
              setBathrooms(event.target.value)
              setSaveState('idle')
            }}
          />

          <TextField
            label="Internal area"
            name="internalArea"
            type="number"
            min="0"
            value={internalArea}
            onChange={(event) => {
              setInternalArea(event.target.value)
              setSaveState('idle')
            }}
            description="Enter the internal area in square feet."
          />

          <TextField
            label="Land area"
            name="landArea"
            type="number"
            min="0"
            step="0.01"
            value={landArea}
            onChange={(event) => {
              setLandArea(event.target.value)
              setSaveState('idle')
            }}
            description="Enter the land area in acres."
          />
        </div>
      </WorkspacePanel>

      <WorkspacePanel
        title="Listing summary"
        description="A short introduction displayed on property cards and listing pages."
      >
        <div>
          <label htmlFor="excerpt" className="block text-sm font-medium text-neutral-900">
            Summary
          </label>

          <textarea
            id="excerpt"
            name="excerpt"
            rows={6}
            value={excerpt}
            onChange={(event) => {
              setExcerpt(event.target.value)
              setSaveState('idle')
            }}
            className="mt-2 w-full resize-y border border-neutral-300 bg-white px-3 py-3 text-sm text-neutral-950 outline-none transition placeholder:text-neutral-400 focus:border-neutral-950"
          />
        </div>
      </WorkspacePanel>

      {saveState === 'error' && errorMessage ? (
        <div
          role="alert"
          className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {errorMessage}
        </div>
      ) : null}

      {saveState === 'success' ? (
        <div
          role="status"
          className="border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
        >
          Property saved successfully.
        </div>
      ) : null}

      {hasChanges ? (
        <div className="sticky bottom-4 z-20 flex flex-col gap-3 border border-neutral-300 bg-white p-4 shadow-lg sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-neutral-900">
            {saveState === 'saving' ? 'Saving changes…' : 'You have unsaved changes.'}
          </p>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={resetForm}
              disabled={saveState === 'saving'}
              className="inline-flex min-h-10 items-center justify-center border border-neutral-300 bg-white px-4 text-sm font-semibold text-neutral-800 hover:border-neutral-950 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Discard
            </button>

            <button
              type="submit"
              disabled={saveState === 'saving' || !title.trim()}
              className="inline-flex min-h-10 items-center justify-center bg-neutral-950 px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saveState === 'saving' ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </div>
      ) : null}
    </form>
  )
}
