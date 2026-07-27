'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

type Version = {
  id: string
  version: number
  updatedAt?: string | null
  uploadedBy?: string | null
  notes?: string | null
  file?: {
    id: string
    filename: string
    url: string
  } | null
}

type Props = {
  documentId: string
  versions: Version[]
  onRestoreSuccess?: () => void
}

type ApiResponse = {
  ok: boolean
  error?: string
  message?: string
}

export function VersionHistory({ documentId, versions, onRestoreSuccess }: Props) {
  const router = useRouter()

  const [restoringVersionId, setRestoringVersionId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  async function restoreVersion(version: Version) {
    const confirmed = window.confirm(
      `Restore Version ${version.version}? The current file will be archived and a new current version will be created.`,
    )

    if (!confirmed) {
      return
    }

    setRestoringVersionId(version.id)
    setError('')
    setSuccessMessage('')

    try {
      const response = await fetch('/api/property-documents/restore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId,
          versionId: version.id,
          notes: `Restored from Version ${version.version}.`,
        }),
      })

      const result = (await response.json()) as ApiResponse

      if (!response.ok || !result.ok) {
        throw new Error(result.error || 'The selected version could not be restored.')
      }

      setSuccessMessage(result.message || `Version ${version.version} was restored successfully.`)

      router.refresh()
      setTimeout(() => {
        onRestoreSuccess?.()
      }, 1000)
    } catch (restoreError) {
      setError(
        restoreError instanceof Error
          ? restoreError.message
          : 'The selected version could not be restored.',
      )
    } finally {
      setRestoringVersionId(null)
    }
  }

  if (versions.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-neutral-300 p-6 text-sm text-neutral-500">
        No previous versions available.
      </div>
    )
  }

  const sorted = [...versions].sort((a, b) => b.version - a.version)

  return (
    <div className="space-y-4">
      {successMessage ? (
        <div
          className="border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
          role="status"
        >
          {successMessage}
        </div>
      ) : null}

      {error ? (
        <div
          className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {error}
        </div>
      ) : null}

      {sorted.map((version) => {
        const isRestoring = restoringVersionId === version.id
        const isAnotherVersionRestoring =
          restoringVersionId !== null && restoringVersionId !== version.id

        return (
          <div key={version.id} className="rounded-lg border border-neutral-200 bg-white p-4">
            <div className="flex items-start justify-between gap-6">
              <div className="min-w-0 flex-1">
                <h4 className="font-semibold text-neutral-950">Version {version.version}</h4>

                <p className="mt-1 text-sm text-neutral-500">
                  {version.updatedAt
                    ? new Date(version.updatedAt).toLocaleString()
                    : 'Unknown date'}
                </p>

                {version.uploadedBy ? (
                  <p className="mt-1 text-sm text-neutral-500">Uploaded by {version.uploadedBy}</p>
                ) : null}

                {version.notes ? (
                  <div className="mt-3 rounded border border-neutral-200 bg-neutral-50 p-3">
                    <p className="text-sm text-neutral-700">{version.notes}</p>
                  </div>
                ) : null}
              </div>

              <div className="flex shrink-0 flex-wrap justify-end gap-2">
                {version.file ? (
                  <>
                    <a
                      href={version.file.url}
                      target="_blank"
                      rel="noreferrer"
                      className="border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-900 transition hover:bg-neutral-100"
                    >
                      Open
                    </a>

                    <a
                      href={version.file.url}
                      download
                      className="border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-900 transition hover:bg-neutral-100"
                    >
                      Download
                    </a>
                  </>
                ) : null}

                <button
                  className="border border-neutral-950 bg-neutral-950 px-3 py-2 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={!version.file || isRestoring || isAnotherVersionRestoring}
                  onClick={() => restoreVersion(version)}
                  type="button"
                >
                  {isRestoring ? 'Restoring…' : 'Restore'}
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
