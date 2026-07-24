'use client'

import type { FormEvent, ReactNode } from 'react'
import { useEffect } from 'react'

type WorkspaceFormProps = {
  children: ReactNode
  hasChanges: boolean
  saving?: boolean
  saved?: boolean
  error?: string | null
  saveLabel?: string
  savingLabel?: string
  discardLabel?: string
  onSave: () => void | Promise<void>
  onDiscard: () => void
  className?: string
}

export function WorkspaceForm({
  children,
  hasChanges,
  saving = false,
  saved = false,
  error,
  saveLabel = 'Save changes',
  savingLabel = 'Saving...',
  discardLabel = 'Discard',
  onSave,
  onDiscard,
  className = '',
}: WorkspaceFormProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const isSaveShortcut = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's'

      if (!isSaveShortcut) {
        return
      }

      event.preventDefault()

      if (!hasChanges || saving) {
        return
      }

      void onSave()
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [hasChanges, onSave, saving])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!hasChanges || saving) {
      return
    }

    void onSave()
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      {children}

      <div
        className={[
          'sticky bottom-0 z-20 mt-8 border-t border-neutral-200 bg-white/95 px-4 py-4 backdrop-blur',
          hasChanges || saving || saved || error ? 'block' : 'hidden',
        ].join(' ')}
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-h-5 text-sm">
            {saving ? <span className="text-neutral-500">Saving changes...</span> : null}

            {!saving && error ? (
              <span role="alert" className="font-medium text-red-700">
                {error}
              </span>
            ) : null}

            {!saving && !error && saved ? (
              <span className="font-medium text-emerald-700">Changes saved.</span>
            ) : null}

            {!saving && !error && !saved && hasChanges ? (
              <span className="text-neutral-500">You have unsaved changes.</span>
            ) : null}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onDiscard}
              disabled={!hasChanges || saving}
              className="inline-flex h-10 items-center justify-center border border-neutral-300 bg-white px-4 text-sm font-semibold text-neutral-800 transition hover:border-neutral-400 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {discardLabel}
            </button>

            <button
              type="submit"
              disabled={!hasChanges || saving}
              className="inline-flex h-10 items-center justify-center bg-neutral-950 px-4 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? savingLabel : saveLabel}
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}
