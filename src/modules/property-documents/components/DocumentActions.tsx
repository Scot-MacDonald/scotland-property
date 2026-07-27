'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

type DocumentActionsProps = {
  documentId: string
  title: string
  fileUrl: string | null
  filename?: string | null
  onEdit: () => void
  onDeleted?: () => void
}

type DeleteApiResponse = {
  ok: boolean
  error?: string
  message?: string
}

export function DocumentActions({
  documentId,
  title,
  fileUrl,
  filename,
  onEdit,
  onDeleted,
}: DocumentActionsProps) {
  const router = useRouter()

  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')

  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  async function handleDelete() {
    const confirmed = window.confirm(`Delete “${title}”? This action cannot be undone.`)

    if (!confirmed) {
      return
    }

    setIsDeleting(true)
    setError('')

    try {
      const response = await fetch('/api/property-documents/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId,
        }),
      })

      const result = (await response.json()) as DeleteApiResponse

      if (!response.ok || !result.ok) {
        throw new Error(result.error || 'The document could not be deleted.')
      }

      setIsOpen(false)
      onDeleted?.()
      router.refresh()
    } catch (deleteError) {
      setError(
        deleteError instanceof Error ? deleteError.message : 'The document could not be deleted.',
      )
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div ref={containerRef} className="relative flex items-start gap-2">
      {fileUrl ? (
        <a
          className="inline-flex h-9 items-center justify-center border border-neutral-300 bg-white px-3 text-sm font-semibold text-neutral-800 transition hover:border-neutral-400 hover:bg-neutral-50"
          href={fileUrl}
          rel="noreferrer"
          target="_blank"
        >
          Open
        </a>
      ) : (
        <span className="inline-flex h-9 items-center justify-center border border-neutral-200 bg-neutral-50 px-3 text-sm text-neutral-400">
          File unavailable
        </span>
      )}

      <button
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={`Actions for ${title}`}
        className="inline-flex h-9 min-w-9 items-center justify-center border border-neutral-300 bg-white px-3 text-sm font-semibold tracking-widest text-neutral-800 transition hover:border-neutral-400 hover:bg-neutral-50"
        disabled={isDeleting}
        onClick={() => {
          setError('')
          setIsOpen((current) => !current)
        }}
        type="button"
      >
        ···
      </button>

      {isOpen ? (
        <div
          className="absolute right-0 top-11 z-20 min-w-48 border border-neutral-200 bg-white py-1 shadow-lg"
          role="menu"
        >
          {fileUrl ? (
            <>
              <a
                className="block w-full px-4 py-2 text-left text-sm text-neutral-800 transition hover:bg-neutral-50"
                href={fileUrl}
                onClick={() => setIsOpen(false)}
                rel="noreferrer"
                role="menuitem"
                target="_blank"
              >
                Open in new tab
              </a>

              <a
                className="block w-full px-4 py-2 text-left text-sm text-neutral-800 transition hover:bg-neutral-50"
                download={filename || title}
                href={fileUrl}
                onClick={() => setIsOpen(false)}
                role="menuitem"
              >
                Download
              </a>
            </>
          ) : (
            <span className="block px-4 py-2 text-sm text-neutral-400">File unavailable</span>
          )}

          <div className="my-1 border-t border-neutral-200" />

          <button
            className="block w-full px-4 py-2 text-left text-sm text-neutral-800 transition hover:bg-neutral-50"
            onClick={() => {
              setIsOpen(false)
              onEdit()
            }}
            role="menuitem"
            type="button"
          >
            Edit details
          </button>

          <div className="my-1 border-t border-neutral-200" />

          <button
            className="block w-full px-4 py-2 text-left text-sm text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isDeleting}
            onClick={handleDelete}
            role="menuitem"
            type="button"
          >
            {isDeleting ? 'Deleting…' : 'Delete'}
          </button>

          {error ? (
            <p className="border-t border-red-100 px-4 py-2 text-xs leading-5 text-red-700">
              {error}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
