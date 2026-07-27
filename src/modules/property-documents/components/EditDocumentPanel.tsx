'use client'

import { useRouter } from 'next/navigation'
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react'
import { VersionHistory } from './VersionHistory'
import type { DocumentCategory, DocumentVisibility, PropertyDocumentType } from '../types'

export type EditablePropertyDocument = {
  id: string
  title: string
  category: DocumentCategory
  documentType: PropertyDocumentType
  visibility: DocumentVisibility
  version?: number | null
  description?: string | null

  file?: {
    id: string
    filename: string
    url: string
  } | null

  versions?: {
    id: string
    version: number
    updatedAt?: string | null
    uploadedBy?: string | null

    file?: {
      id: string
      filename: string
      url: string
    } | null
  }[]
}

type EditDocumentPanelProps = {
  document: EditablePropertyDocument
  onClose: () => void
  onSuccess?: () => void
}

type ApiResponse = {
  ok: boolean
  error?: string
  message?: string
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

function formatFileSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function EditDocumentPanel({
  document: propertyDocument,
  onClose,
  onSuccess,
}: EditDocumentPanelProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [replacementFile, setReplacementFile] = useState<File | null>(null)

  const currentVersion = propertyDocument.version || 1
  const nextVersion = currentVersion + 1

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !isSubmitting) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isSubmitting, onClose])

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] || null

    setReplacementFile(file)
    setError('')
  }

  function removeReplacementFile() {
    setReplacementFile(null)

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  async function updateDocumentMetadata(formData: FormData) {
    const response = await fetch('/api/property-documents/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        documentId: propertyDocument.id,
        title: String(formData.get('title') || '').trim(),
        category: formData.get('category'),
        documentType: formData.get('documentType'),
        visibility: formData.get('visibility'),
        description: String(formData.get('description') || '').trim(),
      }),
    })

    const result = (await response.json()) as ApiResponse

    if (!response.ok || !result.ok) {
      throw new Error(result.error || 'The document details could not be updated.')
    }
  }

  async function replaceDocumentFile(formData: FormData) {
    if (!replacementFile) {
      return
    }

    const replacementData = new FormData()

    replacementData.append('documentId', propertyDocument.id)
    replacementData.append('file', replacementFile)
    replacementData.append('notes', String(formData.get('replacementNotes') || '').trim())

    const response = await fetch('/api/property-documents/replace', {
      method: 'POST',
      body: replacementData,
    })

    const result = (await response.json()) as ApiResponse

    if (!response.ok || !result.ok) {
      throw new Error(result.error || 'The replacement file could not be uploaded.')
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setIsSubmitting(true)
    setError('')

    const formData = new FormData(event.currentTarget)

    try {
      await updateDocumentMetadata(formData)

      if (replacementFile) {
        await replaceDocumentFile(formData)
      }

      router.refresh()
      onSuccess?.()
      onClose()
    } catch (updateError) {
      setError(
        updateError instanceof Error ? updateError.message : 'The document could not be updated.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50">
      <button
        aria-label="Close edit document panel"
        className="absolute inset-0 bg-black/30"
        disabled={isSubmitting}
        onClick={onClose}
        type="button"
      />

      <aside
        aria-labelledby="edit-document-title"
        aria-modal="true"
        className="absolute inset-y-0 right-0 flex w-full max-w-xl flex-col border-l border-neutral-200 bg-white shadow-2xl"
        role="dialog"
      >
        <div className="flex items-start justify-between border-b border-neutral-200 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-neutral-950" id="edit-document-title">
              Edit document
            </h2>

            <p className="mt-1 text-sm text-neutral-500">
              Update the document details or upload a replacement file.
            </p>
          </div>

          <button
            aria-label="Close"
            className="px-2 py-1 text-xl leading-none text-neutral-500 transition hover:text-neutral-950 disabled:opacity-50"
            disabled={isSubmitting}
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>

        <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit}>
          <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
            <div>
              <label
                className="mb-2 block text-sm font-medium text-neutral-900"
                htmlFor="edit-document-name"
              >
                Document title
              </label>

              <input
                required
                className="w-full border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition focus:border-neutral-950"
                defaultValue={propertyDocument.title}
                disabled={isSubmitting}
                id="edit-document-name"
                name="title"
                type="text"
              />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label
                  className="mb-2 block text-sm font-medium text-neutral-900"
                  htmlFor="edit-document-category"
                >
                  Category
                </label>

                <select
                  required
                  className="w-full border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition focus:border-neutral-950"
                  defaultValue={propertyDocument.category}
                  disabled={isSubmitting}
                  id="edit-document-category"
                  name="category"
                >
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
                  htmlFor="edit-document-type"
                >
                  Document type
                </label>

                <select
                  required
                  className="w-full border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition focus:border-neutral-950"
                  defaultValue={propertyDocument.documentType}
                  disabled={isSubmitting}
                  id="edit-document-type"
                  name="documentType"
                >
                  {documentTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label
                  className="mb-2 block text-sm font-medium text-neutral-900"
                  htmlFor="edit-document-visibility"
                >
                  Visibility
                </label>

                <select
                  required
                  className="w-full border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition focus:border-neutral-950"
                  defaultValue={propertyDocument.visibility}
                  disabled={isSubmitting}
                  id="edit-document-visibility"
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
                <p className="mb-2 block text-sm font-medium text-neutral-900">Current version</p>

                <div className="border border-neutral-200 bg-neutral-50 p-4">
                  <p className="text-2xl font-semibold text-neutral-950">
                    Version {currentVersion}
                  </p>

                  <p className="mt-2 text-sm leading-6 text-neutral-600">
                    Version numbers are managed automatically.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label
                className="mb-2 block text-sm font-medium text-neutral-900"
                htmlFor="edit-document-description"
              >
                Description
              </label>

              <textarea
                className="min-h-32 w-full resize-y border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition focus:border-neutral-950"
                defaultValue={propertyDocument.description || ''}
                disabled={isSubmitting}
                id="edit-document-description"
                name="description"
              />
            </div>

            <div className="border-t border-neutral-200 pt-6">
              <div>
                <h3 className="text-base font-semibold text-neutral-950">Replace file</h3>

                <p className="mt-1 text-sm leading-6 text-neutral-500">
                  Uploading a replacement archives the current file as Version {currentVersion} and
                  creates Version {nextVersion}.
                </p>
              </div>

              <div className="mt-4">
                <label
                  className="mb-2 block text-sm font-medium text-neutral-900"
                  htmlFor="edit-document-replacement-file"
                >
                  New file
                </label>

                <input
                  ref={fileInputRef}
                  className="block w-full border border-neutral-300 bg-white text-sm text-neutral-700 file:mr-4 file:border-0 file:border-r file:border-neutral-300 file:bg-neutral-50 file:px-4 file:py-3 file:text-sm file:font-semibold file:text-neutral-900 hover:file:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isSubmitting}
                  id="edit-document-replacement-file"
                  name="replacementFile"
                  onChange={handleFileChange}
                  type="file"
                />
              </div>

              {replacementFile ? (
                <div className="mt-3 flex items-start justify-between gap-4 border border-neutral-200 bg-neutral-50 p-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-neutral-950">
                      {replacementFile.name}
                    </p>

                    <p className="mt-1 text-xs text-neutral-500">
                      {formatFileSize(replacementFile.size)}
                    </p>
                  </div>

                  <button
                    className="shrink-0 text-sm font-semibold text-neutral-600 transition hover:text-neutral-950 disabled:opacity-50"
                    disabled={isSubmitting}
                    onClick={removeReplacementFile}
                    type="button"
                  >
                    Remove
                  </button>
                </div>
              ) : null}

              <div className="mt-4">
                <label
                  className="mb-2 block text-sm font-medium text-neutral-900"
                  htmlFor="edit-document-replacement-notes"
                >
                  Replacement notes
                </label>

                <textarea
                  className="min-h-24 w-full resize-y border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition focus:border-neutral-950 disabled:bg-neutral-50 disabled:text-neutral-400"
                  disabled={!replacementFile || isSubmitting}
                  id="edit-document-replacement-notes"
                  name="replacementNotes"
                  placeholder="Explain why the current file is being replaced."
                />
              </div>

              {replacementFile ? (
                <div className="mt-4 border border-amber-200 bg-amber-50 px-4 py-3">
                  <p className="text-sm font-medium text-amber-950">
                    Saving will create Version {nextVersion}.
                  </p>

                  <p className="mt-1 text-sm leading-6 text-amber-800">
                    The current file will remain available in the document history.
                  </p>
                </div>
              ) : null}
            </div>

            <div className="border-t border-neutral-200 pt-6">
              <h3 className="mb-4 text-base font-semibold text-neutral-950">Version History</h3>
              <VersionHistory
                documentId={propertyDocument.id}
                versions={propertyDocument.versions ?? []}
                onRestoreSuccess={() => {
                  router.refresh()
                  onSuccess?.()
                  onClose()
                }}
              />
            </div>

            {error ? (
              <div
                className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                role="alert"
              >
                {error}
              </div>
            ) : null}
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-neutral-200 px-6 py-5">
            <button
              className="border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isSubmitting}
              onClick={onClose}
              type="button"
            >
              Cancel
            </button>

            <button
              className="bg-neutral-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting
                ? replacementFile
                  ? 'Saving and replacing…'
                  : 'Saving…'
                : replacementFile
                  ? `Save as Version ${nextVersion}`
                  : 'Save changes'}
            </button>
          </div>
        </form>
      </aside>
    </div>
  )
}
