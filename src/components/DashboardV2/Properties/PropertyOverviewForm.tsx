'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { TextField } from '@/components/DashboardV2/Fields'
import { WorkspaceForm, WorkspacePanel } from '@/components/DashboardV2/Workspace'

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

type PropertyOverviewValues = {
  title: string
  reference: string
  excerpt: string
  bedrooms: string
  bathrooms: string
  internalArea: string
  landArea: string
}

type SaveState = 'idle' | 'saving' | 'success' | 'error'

function getInitialValues(property: PropertyOverviewFormProps['property']): PropertyOverviewValues {
  return {
    title: property.title,
    reference: property.reference || '',
    excerpt: property.excerpt || '',
    bedrooms: property.bedrooms?.toString() || '',
    bathrooms: property.bathrooms?.toString() || '',
    internalArea: property.internalArea?.toString() || '',
    landArea: property.landArea?.toString() || '',
  }
}

export function PropertyOverviewForm({ property }: PropertyOverviewFormProps) {
  const router = useRouter()

  const initialValues = getInitialValues(property)

  const [title, setTitle] = useState(initialValues.title)
  const [reference, setReference] = useState(initialValues.reference)
  const [excerpt, setExcerpt] = useState(initialValues.excerpt)
  const [bedrooms, setBedrooms] = useState(initialValues.bedrooms)
  const [bathrooms, setBathrooms] = useState(initialValues.bathrooms)
  const [internalArea, setInternalArea] = useState(initialValues.internalArea)
  const [landArea, setLandArea] = useState(initialValues.landArea)

  const [savedValues, setSavedValues] = useState<PropertyOverviewValues>(initialValues)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const currentValues: PropertyOverviewValues = {
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

  function clearSaveFeedback() {
    setSaveState('idle')
    setErrorMessage('')
  }

  function resetForm() {
    setTitle(savedValues.title)
    setReference(savedValues.reference)
    setExcerpt(savedValues.excerpt)
    setBedrooms(savedValues.bedrooms)
    setBathrooms(savedValues.bathrooms)
    setInternalArea(savedValues.internalArea)
    setLandArea(savedValues.landArea)

    clearSaveFeedback()
  }

  async function handleSave() {
    if (!title.trim()) {
      setSaveState('error')
      setErrorMessage('Property title is required.')
      return
    }

    setSaveState('saving')
    setErrorMessage('')

    const valuesToSave: PropertyOverviewValues = {
      title: title.trim(),
      reference: reference.trim(),
      excerpt: excerpt.trim(),
      bedrooms,
      bathrooms,
      internalArea,
      landArea,
    }

    const formData = new FormData()

    formData.set('id', property.id)
    formData.set('title', valuesToSave.title)
    formData.set('reference', valuesToSave.reference)
    formData.set('excerpt', valuesToSave.excerpt)
    formData.set('bedrooms', valuesToSave.bedrooms)
    formData.set('bathrooms', valuesToSave.bathrooms)
    formData.set('internalArea', valuesToSave.internalArea)
    formData.set('landArea', valuesToSave.landArea)

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

      setTitle(valuesToSave.title)
      setReference(valuesToSave.reference)
      setExcerpt(valuesToSave.excerpt)
      setSavedValues(valuesToSave)
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
    <WorkspaceForm
      hasChanges={hasChanges}
      saving={saveState === 'saving'}
      saved={saveState === 'success'}
      error={saveState === 'error' ? errorMessage : null}
      onSave={handleSave}
      onDiscard={resetForm}
      className="space-y-6"
    >
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
                clearSaveFeedback()
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
              clearSaveFeedback()
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
              clearSaveFeedback()
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
              clearSaveFeedback()
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
              clearSaveFeedback()
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
              clearSaveFeedback()
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
              clearSaveFeedback()
            }}
            className="mt-2 w-full resize-y border border-neutral-300 bg-white px-3 py-3 text-sm text-neutral-950 outline-none transition placeholder:text-neutral-400 focus:border-neutral-950"
          />
        </div>
      </WorkspacePanel>
    </WorkspaceForm>
  )
}
