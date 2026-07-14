'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { SelectField, TextField, ToggleField } from '@/components/DashboardV2/Fields'
import { WorkspacePanel } from '@/components/DashboardV2/Workspace'

type PricingTabProps = {
  propertyId: string
  title: string
  price?: number | null
  status?: string | null
  featured?: boolean | null
}

type SaveState = 'idle' | 'saving' | 'success' | 'error'

const statusOptions = [
  {
    label: 'For Sale',
    value: 'for-sale',
  },
  {
    label: 'Reserved',
    value: 'reserved',
  },
  {
    label: 'Sold',
    value: 'sold',
  },
]

export function PricingTab({
  propertyId,
  title,
  price: initialPrice,
  status: initialStatus,
  featured: initialFeatured,
}: PricingTabProps) {
  const router = useRouter()

  const initialValues = {
    price: initialPrice?.toString() || '',
    status: initialStatus || 'for-sale',
    featured: Boolean(initialFeatured),
  }

  const [price, setPrice] = useState(initialValues.price)
  const [status, setStatus] = useState(initialValues.status)
  const [featured, setFeatured] = useState(initialValues.featured)
  const [savedValues, setSavedValues] = useState(initialValues)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const hasChanges =
    price !== savedValues.price ||
    status !== savedValues.status ||
    featured !== savedValues.featured

  function resetForm() {
    setPrice(savedValues.price)
    setStatus(savedValues.status)
    setFeatured(savedValues.featured)
    setSaveState('idle')
    setErrorMessage('')
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setSaveState('saving')
    setErrorMessage('')

    const formData = new FormData()

    formData.set('id', propertyId)
    formData.set('title', title)
    formData.set('price', price)
    formData.set('status', status)
    formData.set('featured', String(featured))

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
        throw new Error(result.error || 'Could not update pricing.')
      }

      const nextSavedValues = {
        price,
        status,
        featured,
      }

      setSavedValues(nextSavedValues)
      setSaveState('success')

      router.refresh()

      window.setTimeout(() => {
        setSaveState('idle')
      }, 2500)
    } catch (error) {
      setSaveState('error')
      setErrorMessage(error instanceof Error ? error.message : 'Could not update pricing.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <WorkspacePanel
        title="Pricing"
        description="Control the asking price, listing status and availability."
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <TextField
            label="Price"
            name="price"
            type="number"
            min="0"
            step="1"
            value={price}
            onChange={(event) => {
              setPrice(event.target.value)
              setSaveState('idle')
            }}
            description="Enter the asking price in pounds."
          />

          <SelectField
            label="Status"
            name="status"
            value={status}
            options={statusOptions}
            onChange={(event) => {
              setStatus(event.target.value)
              setSaveState('idle')
            }}
          />

          <div className="sm:col-span-2">
            <ToggleField
              label="Featured property"
              name="featured"
              checked={featured}
              onChange={(checked) => {
                setFeatured(checked)
                setSaveState('idle')
              }}
              description="Featured properties may receive additional prominence across the public portal."
            />
          </div>
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
          Pricing saved successfully.
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
              disabled={saveState === 'saving'}
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
