'use client'

import { useMemo, type ChangeEvent, type DragEvent, type RefObject } from 'react'

type WorkspaceUploadFieldProps = {
  accept?: string
  description: string
  file: File | null
  inputRef: RefObject<HTMLInputElement | null>
  label: string
  multiple?: boolean
  previewUrl?: string | null
  filename?: string | null
  onChoose: () => void
  onDrop: (files: FileList) => void
  onFileChange: (file: File | null) => void
  onRemove: () => void
}

export function WorkspaceUploadField({
  accept,
  description,
  file,
  filename,
  inputRef,
  label,
  multiple = false,
  onChoose,
  onDrop,
  onFileChange,
  onRemove,
  previewUrl,
}: WorkspaceUploadFieldProps) {
  const localPreview = useMemo(() => {
    if (!file) return null

    if (!file.type.startsWith('image/')) {
      return null
    }

    return URL.createObjectURL(file)
  }, [file])

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()

    if (event.dataTransfer.files.length > 0) {
      onDrop(event.dataTransfer.files)
    }
  }

  return (
    <div
      className="border border-neutral-200 bg-white"
      onDragOver={(event) => event.preventDefault()}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        className="sr-only"
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          onFileChange(event.target.files?.[0] || null)
          event.target.value = ''
        }}
      />

      {localPreview || previewUrl ? (
        <div className="aspect-[1.9/1] overflow-hidden bg-neutral-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={localPreview || previewUrl || ''}
            alt={label}
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <div className="flex min-h-56 items-center justify-center bg-neutral-50 p-8 text-center">
          <div>
            <p className="text-base font-semibold text-neutral-900">{label}</p>

            <p className="mt-2 text-sm leading-6 text-neutral-500">{description}</p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 border-t border-neutral-200 p-4">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm text-neutral-700">
            {file?.name || filename || 'No file selected'}
          </p>
        </div>

        <button
          type="button"
          className="border border-neutral-300 px-4 py-2 text-sm"
          onClick={onChoose}
        >
          {file || filename ? 'Replace' : 'Choose file'}
        </button>

        {(file || filename) && (
          <button
            type="button"
            className="border border-red-200 px-4 py-2 text-sm text-red-700"
            onClick={onRemove}
          >
            Remove
          </button>
        )}
      </div>
    </div>
  )
}
