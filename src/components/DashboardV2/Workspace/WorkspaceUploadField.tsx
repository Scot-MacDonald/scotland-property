'use client'

import { useEffect, useMemo, type ChangeEvent, type DragEvent, type RefObject } from 'react'

type WorkspaceUploadFieldProps = {
  accept?: string
  description: string
  file: File | null
  filename?: string | null
  inputRef: RefObject<HTMLInputElement | null>
  label: string
  multiple?: boolean
  previewType?: 'image' | 'document'
  previewUrl?: string | null
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
  previewType = 'image',
  previewUrl,
}: WorkspaceUploadFieldProps) {
  const localPreview = useMemo(() => {
    if (!file || !file.type.startsWith('image/')) {
      return null
    }

    return URL.createObjectURL(file)
  }, [file])

  useEffect(() => {
    return () => {
      if (localPreview) {
        URL.revokeObjectURL(localPreview)
      }
    }
  }, [localPreview])

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
        accept={accept}
        className="sr-only"
        multiple={multiple}
        type="file"
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          onFileChange(event.target.files?.[0] || null)
          event.target.value = ''
        }}
      />

      {previewType === 'image' && (localPreview || previewUrl) ? (
        <div className="aspect-[1.9/1] overflow-hidden bg-neutral-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt={label}
            className="h-full w-full object-cover"
            src={localPreview || previewUrl || ''}
          />
        </div>
      ) : previewType === 'document' ? (
        <div className="aspect-[1.9/1] flex flex-col items-center justify-center border-b border-neutral-200 bg-neutral-50 p-8 text-center">
          <div className="flex h-16 w-14 items-center justify-center border border-neutral-300 bg-white">
            <span className="text-[10px] font-bold tracking-[0.3em] text-neutral-500">PDF</span>
          </div>
          <h3 className="mt-6 text-2xl font-semibold text-neutral-950">{label}</h3>
          <p className="mt-3 max-w-sm text-sm leading-6 text-neutral-500">{description}</p>
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
          className="border border-neutral-300 px-4 py-2 text-sm"
          type="button"
          onClick={onChoose}
        >
          {file || filename ? 'Replace' : 'Choose file'}
        </button>

        {(file || filename) && (
          <button
            className="border border-red-200 px-4 py-2 text-sm text-red-700"
            type="button"
            onClick={onRemove}
          >
            Remove
          </button>
        )}
      </div>
    </div>
  )
}
