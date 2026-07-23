type WorkspaceStatusFooterProps = {
  error?: string
  isDirty: boolean
  isSaving: boolean
  message?: string
  onDiscard: () => void
  onSave: () => void
  saveLabel?: string
}

export function WorkspaceStatusFooter({
  error,
  isDirty,
  isSaving,
  message,
  onDiscard,
  onSave,
  saveLabel = 'Save changes',
}: WorkspaceStatusFooterProps) {
  return (
    <div className="sticky bottom-0 flex flex-wrap items-center justify-between gap-4 border border-neutral-200 bg-white p-4 shadow-[0_-8px_30px_rgba(0,0,0,0.04)]">
      <div>
        {error ? <p className="text-sm text-red-700">{error}</p> : null}

        {message ? <p className="text-sm text-emerald-700">{message}</p> : null}

        {!error && !message ? (
          <p className="text-sm text-neutral-500">
            {isDirty ? 'You have unsaved changes.' : 'All changes are saved.'}
          </p>
        ) : null}
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          className="border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
          disabled={!isDirty || isSaving}
          onClick={onDiscard}
        >
          Discard
        </button>

        <button
          type="button"
          className="border border-neutral-950 bg-neutral-950 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
          disabled={!isDirty || isSaving}
          onClick={onSave}
        >
          {isSaving ? 'Saving…' : saveLabel}
        </button>
      </div>
    </div>
  )
}
