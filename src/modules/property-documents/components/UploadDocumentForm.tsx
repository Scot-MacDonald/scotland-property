'use client'

import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'

type UploadDocumentFormProps = {
  propertyId: string
  onSuccess?: () => void
  onCancel?: () => void
}

type ApiResponse = {
  ok: boolean
  error?: string
}

const categoryOptions = [
  { value: 'marketing', label: 'Marketing' },
  { value: 'legal', label: 'Legal' },
  { value: 'compliance', label: 'Compliance' },
  { value: 'internal', label: 'Internal' },
] as const

const documentTypeOptions = [
  { value: 'brochure', label: 'Brochure' },
  { value: 'floorplan', label: 'Floorplan' },
  { value: 'home-report', label: 'Home Report' },
  { value: 'epc', label: 'EPC' },
  { value: 'planning', label: 'Planning Document' },
  { value: 'title-deed', label: 'Title Deed' },
  { value: 'lease', label: 'Lease' },
  { value: 'survey', label: 'Survey' },
  { value: 'valuation', label: 'Valuation' },
  { value: 'vendor-contract', label: 'Vendor Contract' },
  { value: 'sales-memorandum', label: 'Sales Memorandum' },
  { value: 'aml', label: 'AML Document' },
  { value: 'identity', label: 'Identity Document' },
  { value: 'certificate', label: 'Certificate' },
  {
    value: 'solicitor-correspondence',
    label: 'Solicitor Correspondence',
  },
  { value: 'other', label: 'Other' },
] as const

const visibilityOptions = [
  { value: 'public', label: 'Public' },
  { value: 'agency', label: 'Agency only' },
  { value: 'admin', label: 'Administrators only' },
] as const

export function UploadDocumentForm({ propertyId, onSuccess, onCancel }: UploadDocumentFormProps) {
  const router = useRouter()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setIsSubmitting(true)
    setError('')
    setSuccessMessage('')

    const form = event.currentTarget
    const formData = new FormData(form)

    formData.set('propertyId', propertyId)

    try {
      const response = await fetch('/api/property-documents/create', {
        method: 'POST',
        body: formData,
      })

      const result = (await response.json()) as ApiResponse

      if (!response.ok || !result.ok) {
        throw new Error(result.error || 'The document could not be uploaded.')
      }

      form.reset()
      setSuccessMessage('Document uploaded successfully.')

      router.refresh()
      onSuccess?.()
    } catch (uploadError) {
      setError(
        uploadError instanceof Error ? uploadError.message : 'The document could not be uploaded.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div>
        <label className="mb-2 block text-sm font-medium text-neutral-900" htmlFor="document-title">
          Document title
        </label>

        <input
          required
          className="w-full border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition focus:border-neutral-900"
          id="document-title"
          name="title"
          placeholder="For example, Property Brochure"
          type="text"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label
            className="mb-2 block text-sm font-medium text-neutral-900"
            htmlFor="document-category"
          >
            Category
          </label>

          <select
            required
            className="w-full border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition focus:border-neutral-900"
            defaultValue=""
            id="document-category"
            name="category"
          >
            <option disabled value="">
              Select category
            </option>

            {categoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            className="mb-2 block text-sm font-medium text-neutral-900"
            htmlFor="document-type"
          >
            Document type
          </label>

          <select
            required
            className="w-full border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition focus:border-neutral-900"
            defaultValue=""
            id="document-type"
            name="documentType"
          >
            <option disabled value="">
              Select document type
            </option>

            {documentTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label
            className="mb-2 block text-sm font-medium text-neutral-900"
            htmlFor="document-visibility"
          >
            Visibility
          </label>

          <select
            required
            className="w-full border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition focus:border-neutral-900"
            defaultValue="agency"
            id="document-visibility"
            name="visibility"
          >
            {visibilityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            className="mb-2 block text-sm font-medium text-neutral-900"
            htmlFor="document-version"
          >
            Version
          </label>

          <input
            required
            className="w-full border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition focus:border-neutral-900"
            defaultValue="1"
            id="document-version"
            min="1"
            name="version"
            step="1"
            type="number"
          />
        </div>
      </div>

      <div>
        <label
          className="mb-2 block text-sm font-medium text-neutral-900"
          htmlFor="document-description"
        >
          Description
        </label>

        <textarea
          className="min-h-28 w-full resize-y border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition focus:border-neutral-900"
          id="document-description"
          name="description"
          placeholder="Optional internal notes or context"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-neutral-900" htmlFor="document-file">
          File
        </label>

        <input
          required
          className="block w-full border border-neutral-300 bg-white text-sm text-neutral-700 file:mr-4 file:border-0 file:border-r file:border-neutral-300 file:bg-neutral-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-neutral-900 hover:file:bg-neutral-200"
          id="document-file"
          name="file"
          type="file"
        />

        <p className="mt-2 text-xs text-neutral-500">
          Upload a PDF, image, or other supported document file.
        </p>
      </div>

      {error ? (
        <div
          className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {error}
        </div>
      ) : null}

      {successMessage ? (
        <div
          className="border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
          role="status"
        >
          {successMessage}
        </div>
      ) : null}

      <div className="flex items-center justify-end gap-3 border-t border-neutral-200 pt-6">
        {onCancel ? (
          <button
            className="border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isSubmitting}
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
        ) : null}

        <button
          className="bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? 'Uploading…' : 'Upload document'}
        </button>
      </div>
    </form>
  )
}
